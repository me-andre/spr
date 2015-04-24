var _ = require('lodash'),
    vinyl = require('vinyl-fs'),
    stream = require('stream'),
    async = require('async'),
    path = require('path'),
    sortDependencies = require('./spr/sortDependencies'),
    parseFile = require('./spr/parseFile');

module.exports = resolve;

function resolve(filePath, cb) {
    var dir = path.dirname(filePath),
        pending = [],
        files = {};

    parseFile(filePath, function(err, deps) {
        err ? cb(err) : queryDeps(filePath, deps);
    });

    function done() {
        var main = relative(filePath);
        cb(null, sortDependencies(main, files));
    }

    function queryDeps(filePath, deps) {
        var name = relative(filePath),
            dir = path.dirname(filePath),
            collector = new stream.Writable({objectMode: true});

        files[name] = deps;

        collector._write = function(file, __, cb) {
            var filePath = file.path,
                fileName = relative(filePath);
            if (_.has(files, fileName)) {
                cb();
            } else {
                parseFile(filePath, function(err, deps) {
                    if (!err) queryDeps(filePath, deps);
                    cb(err);
                });
            }
        };
        pending.push(collector);
        collector.on('finish', function() {
            _.remove(pending, collector);
            if (!pending.length) done();
        });
        async.each(deps, function(dep, cb) {
            if (dep.isFile()) {
                var filesStream = vinyl.src(dep.glob + '.js', {read: false, cwd: dir});
                filesStream.on('data', function(file) {
                    dep.resolved.push(relative(file.path));
                    collector.write(file);
                });
                filesStream.on('end', cb);
                filesStream.on('error', cb);
            } else {
                cb();
            }
        }, function(err) {
            err ? collector.emit('error', err) : collector.end();
        });
    }

    function relative(filePath) {
        return path.relative(dir, filePath);
    }
}