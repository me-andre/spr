var _ = require('lodash'),
    Dependency = require('./Dependency');

module.exports = Comment;

function Comment(type, content) {
    this.type = type;
    this.content = content;
}

var requirePattern = '=\\s*require(?:_(self)\\s*|\\s+(.*))$',
    requireRegexp = {
        '//': new RegExp('^\\s*' + requirePattern),
        '/*': new RegExp('^(?:\\s|\\*)*' + requirePattern)
    };

_.assign(Comment.prototype, {
    parse: function() {
        var dependencies = [];
        function parseLine(line) {
            var dependency = this.parseLine(line);
            if (dependency) dependencies.push(dependency);
        }
        if (this.type === '//') {
            parseLine.call(this, this.content);
        } else {
            _.each(this.content.split('\n'), parseLine, this);
        }
        return dependencies;
    },
    requireRegexp: function() {
        return requireRegexp[this.type];
    },
    parseLine: function(commentLine) {
        var dependency = null;
        var match = commentLine.match(this.requireRegexp());
        if (match) dependency = match[1] ? Dependency.self() : Dependency.file(match[2]);
        return dependency;
    }
});