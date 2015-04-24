var _ = require('lodash'),
    LinkedItem = require('./LinkedItem');

module.exports = sortDependencies;

function NamedBranch(name, subBranches) {
    this.name = name;
    this.sub = subBranches;
    this.source = true;
    LinkedItem.call(this);
}

_.assign(NamedBranch.prototype, LinkedItem.prototype, {
    isBefore: function(leaf) {
        return this.index && this.index >= 0 && this.index <= leaf.index;
    }
});

function sortDependencies(branchName, filesWithDeps) {
    var flatTree = _.mapValues(filesWithDeps, function(deps, name) {
        return new NamedBranch(name, deps);
    });

    var branch = flatTree[branchName];

    branch.before(null);

    alignDeps(branch);

    return compile();

    function compile() {
        var deps = [],
            next = branch;
        while (next.prev) next = next.prev;
        do {
            if (next.source) deps.push(next.name);
        } while (next = next.next);
        return deps;
    }

    function alignDeps(branch) {
        _.each(branch.sub, function(sub) {
            if (sub.isSelf()) {
                branch.source = false;
                sub = new NamedBranch(branch.name, []);
                sub.before(branch);
            } else if (sub.isFile()) {
                _.each(sub.resolved, function(name) {
                    var sub = flatTree[name];
                    if (sub.isBefore(branch)) return;
                    sub.before(branch);
                    alignDeps(sub);
                });
            } else {
                throw new Error('unknown dep.type');
            }
        });
    }

}