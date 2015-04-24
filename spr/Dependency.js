var _ = require('lodash');

module.exports = Dependency;

function Dependency(type, glob) {
    this._type = type;
    this.glob = glob;
    this.resolved = [];
}

Dependency.TYPE = {
    FILE: 0,
    SELF: 1
};

_.assign(Dependency, {
    self: function() {
        return new Dependency(Dependency.TYPE.SELF);
    },
    file: function(glob) {
        return new Dependency(Dependency.TYPE.FILE, glob);
    }
});

_.assign(Dependency.prototype, {
    isFile: function() {
        return this._type === Dependency.TYPE.FILE;
    },
    isSelf: function() {
        return this._type === Dependency.TYPE.SELF;
    },
    type: function() {
        switch (this._type) {
            case Dependency.TYPE.FILE: return 'file';
            case Dependency.TYPE.SELF: return 'self';
        }
    }
});