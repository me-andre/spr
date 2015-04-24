module.exports = LinkedItem;

var _ = require('lodash');

function LinkedItem() {
    this.prev = this.next = null;
    this.index = -1;
}

_.assign(LinkedItem.prototype, {
    before: function(leaf) {
        before(leaf, this);
    },
    after: function(leaf) {
        after(leaf, this);
    }
});

function remove(leaf) {
    if (leaf.next) leaf.next.prev = leaf.prev;
    if (leaf.prev) leaf.prev.next = leaf.next;
    leaf.prev = leaf.next = null;
    leaf.index = -1;
}

function after(prev, leaf) {
    if (leaf.prev || leaf.next) remove(leaf);
    leaf.prev = prev;
    if (prev) leaf.next = prev.next;
    tie(leaf);
    setIndex(leaf);
    adjustIndexes(leaf);
}

function adjustIndexes(leaf) {
    while (leaf = leaf.next) {
        leaf.index = leaf.prev.index + 1;
    }
}

function setIndex(leaf) {
    leaf.index = leaf.prev ? leaf.prev.index + 1 : 0;
}

function tie(leaf) {
    if (leaf.next) leaf.next.prev = leaf;
    if (leaf.prev) leaf.prev.next = leaf;
}

function before(next, leaf) {
    if (leaf.prev || leaf.next) remove(leaf);
    leaf.next = next;
    if (next) leaf.prev = next.prev;
    tie(leaf);
    setIndex(leaf);
    adjustIndexes(leaf);
}