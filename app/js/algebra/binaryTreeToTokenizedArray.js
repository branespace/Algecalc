var Term = require('./terms/term.js');
var operations = require('./operations/operations');

module.exports = function(tree) {
    var tokens = [];
    infixTraverse(tree, tokens);
    return tokens;
}

function infixTraverse(tree, tokens) {
    if (operations.hasOwnProperty(tree.node.token)) {
        tokens.push(new Term('(', 0, 'parenthesis'));
    }
    if (tree.left) {
        infixTraverse(tree.left, tokens);
    }
    tokens.push(tree.node);
    if (tree.right) {
        infixTraverse(tree.right, tokens);
    }
    if (operations.hasOwnProperty(tree.node.token)) {
        tokens.push(new Term(')', 0, 'parenthesis'));
    }    
}