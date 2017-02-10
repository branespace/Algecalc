var utility = {};

utility.sortArraysTogether = function (a, b, predicate) {
    var list = [];
    for (var i in a) {
        list.push({a: a[i], b: b[i]});
    }

    if (!predicate) {
        list.sort(function(a, b) { return a.a == b.a ? 0 : +(a.a > b.a) || -1;} );
    } else {
        list.sort(predicate);
    }

    for (var i in list) {
        a[i] = list[i].a;
        b[i] = list[i].b;
    }

    return {a: a, b: b};
}

utility.BinaryNode = BinaryNode;
function BinaryNode(node, parent, left, right) {
    this.node = node;
    this.left = left ? left : null;
    this.right = right ? right : null;
    this.parent = parent ? parent : null;
}

utility.flattenTree = function flattenTree(tree, nodes, level) {
    if (tree.left) {
        flattenTree(tree.left, nodes, level + 1);
    }
    if (!nodes[level]) {
        nodes[level] = [];
    }
    nodes[level].push(tree);
    if (tree.right) {
        flattenTree(tree.right, nodes, level + 1);
    }
}

module.exports = utility;