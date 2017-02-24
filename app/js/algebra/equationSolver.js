var algebra = require('./algebra.js');
var simplify = require('./evaluateBinaryTree.js');
var utility = require('./../utility/utility.js');
var Term = require('./terms/term.js');
var operations = algebra.operations;

module.exports = function equationSolver(left, right) {
    var result = {steps: []};

    if (!containsVariable(left) && containsVariable(right)) {
        var temp = right;
        right = left;
        left = temp;
    }

    while (containsVariable(left) && left.node.type != 'variable') {
        if (containsVariable(left.left) && containsVariable(left.right)) {
            var simplified = simplify(left);
            if (!simplified) {
                return false;
            }
            left = simplified.result;
            for (var i = 0; i < simplified.steps.length; i++) {
                result.steps[i] = {};
                result.steps[i].left = simplified.steps[i].tree;
                result.steps[i].right = right;
                result.steps[i].nodes = simplified.steps[i].nodes;
            }
        }
        if (containsVariable(left.left)) {
            var step = {};
            step.left = utility.copyBranch(left);;
            step.right = utility.copyBranch(right);
            step.nodes = [left.node, left.right.node];
            result.steps.push(step);
            right = new utility.BinaryNode(new Term(operations[left.node.token].inverse, 0, 'operator'), null, right, left.right);
            left.right.parent = right;
            right.left.parent = right;
            left = left.left;
            left.parent = null;
        } else if (containsVariable(left.right)) {
            var step = {};
            step.left = utility.copyBranch(left);;
            step.right = utility.copyBranch(right);
            step.nodes = [left.node, left.left.node];
            result.steps.push(step);
            right = new utility.BinaryNode(new Term(operations[left.node.token].inverse, 0, 'operator'), null, right, left.left);
            left.left.parent = right;
            right.left.parent = right;
            left = left.right;
            left.parent = null;
        }
    }

    while (containsVariable(right)) {
        //Clear variables from right side
    }

    //Handle coefficients
    if (left.node.coefficient != 1) {
        var step = {};
        step.left = utility.copyBranch(left);;
        step.right = utility.copyBranch(right);
        step.nodes = [left.node];
        result.steps.push(step);
        right = new utility.BinaryNode(new Term('/', 0, 'operator'), null, right, null);
        right.right = new utility.BinaryNode(new Term('', 0, 'constant', left.node.coefficient), right, null, null);
        right.left.parent = right;
        left.node = new Term('', left.node.parenLevel, 'variable', 1, left.node.symbol, left.node.power);
    }

    //Simplify results
    var simplified = simplify(left);
    if (simplified) {
        left = simplified.tree;
        for (var i = 0; i < simplified.steps.length; i++) {
            var step = {};
            step.left = simplified.steps[i].tree;
            step.right = right;
            step.nodes = simplified.steps[i].nodes;
            result.steps.push(step);
        }
    }

    var simplified = simplify(right);
    if (simplified) {
        right = simplified.tree;
        for (var i = 0; i < simplified.steps.length; i++) {
            var step = {};
            step.left = left;
            step.right = simplified.steps[i].tree;
            step.nodes = simplified.steps[i].nodes;
            result.steps.push(step);
        }
    }  

    result.left = left;
    result.right = right;

    return result;

};

function containsVariable(tree) {
    return ((tree.left ? containsVariable(tree.left) : false) ||
            (tree.right ? containsVariable(tree.right) : false) ||
            (tree && tree.node && tree.node.type == 'variable'));
}