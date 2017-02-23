var Term = require('./terms/term.js');
var operations = require('./operations/operations');

//Converts binary tree to array of tokens
module.exports = function(tree) {
    var tokens = [];
    infixTraverse(tree, tokens);

    //Only got one token? return it
    if (tokens.length == 1) {
        return tokens;
    }

    //Remover leading and trailing parens
    return tokens.slice(1, -1);
}

//Recursive in order traversal
function infixTraverse(tree, tokens) {
    //Operator, so begin a new set of parens
    if (operations.hasOwnProperty(tree.node.token)) {
        tokens.push(new Term('(', 0, 'parenthesis'));
    }

    //Traverse left side
    if (tree.left) {
        infixTraverse(tree.left, tokens);
    }

    //Add node
    tokens.push(tree.node);

    //Traverse right side
    if (tree.right) {
        infixTraverse(tree.right, tokens);
    }

    //We've processed all children, so close our parentheses
    if (operations.hasOwnProperty(tree.node.token)) {
        tokens.push(new Term(')', 0, 'parenthesis'));
    }    
}