var operations = require('./operations/operations');
var utility = require('./../utility/utility.js');
var Term = require('./terms/term.js');
var BinaryNode = require('./../utility/utility.js').BinaryNode;
var postfixToTree = require('./postfixToBinaryTree.js');
var tokenToPostfix = require('./tokenToPostfix.js');

module.exports = function(tree) {
    var steps = [];
    var nodes = [[]];
    var result;
    var treeCopy;
    utility.flattenTree(tree, nodes, 0);
    for (var i = nodes.length - 1; i >= 0; i--) {
        for (var k = 0; k < nodes[i].length; k++) {
            for (var j = 0; j <= operations.maxPreced; j++) {
                var node = nodes[i][k];
                if (node.node.type == 'operator' && operations[node.node.token].preced == j) {
                    if (!operations[node.node.token].distrib) {
                        treeCopy = copyBranch(tree);
                        result = calculateNode(node, nodes);
                        if (result) {
                            tree = nodes[0][0];
                            steps.push({tree: treeCopy, nodes: result});
                            nodes = [];
                            utility.flattenTree(tree, nodes, 0); 
                            i = nodes.length - 1;
                            k = 0;
                            j = -1;                                  
                        }      
                    } else if (operations[node.node.token].distrib && operations[node.node.token].assoc == 'left') {
                        var lhs = [],
                            rhs = [];
                        collectSubTreeTerms(node.left, lhs);
                        collectSubTreeTerms(node.right, rhs);
                        if (lhs.length == 1 && rhs.length == 1) {
                            //Single node
                            treeCopy = copyBranch(tree);   
                            result = calculateNode(node, nodes);                                                     
                            if (result) {
                                tree = nodes[0][0];
                                steps.push({tree: treeCopy, nodes: result});
                                nodes = [];
                                utility.flattenTree(tree, nodes, 0); 
                                i = nodes.length - 1;
                                k = 0;
                                j = -1;                                  
                            }                    
                        } else {
                            //Distribution
                            var expr = [];
                            for (var leftOperand = 0; leftOperand < lhs.length; leftOperand++) {
                                for (var rightOperand = 0; rightOperand < rhs.length; rightOperand++) {
                                    if (leftOperand != 0 || rightOperand != 0) {
                                        expr.push(new Term('+', 0, 'operator'));
                                    }
                                    expr.push(lhs[leftOperand].node);
                                    expr.push(new Term('*', 0, 'operator'));
                                    expr.push(rhs[rightOperand].node);
                                }
                            }
                            var postfixExpr = tokenToPostfix(expr);
                            var subTree = postfixToTree(postfixExpr);
                            if (node.parent) {
                                subTree.parent = node.parent;
                                if (node.parent.left == node) {
                                    node.parent.left = subTree;
                                } else {
                                    node.parent.right = subTree;
                                }
                            } else {
                                tree = subTree;
                            }
                            nodes = [];
                            utility.flattenTree(tree, nodes, 0);
                            i = nodes.length - 1;
                            k = 0;
                            j = -1;
                        }
                    }
                }
            }
        }
    }
    return {tree: nodes[0][0], steps: steps};
};

function collectSubTreeTerms(tree, nodes) {
    if (tree.left && !operations[tree.node.token].distrib) {
        collectSubTreeTerms(tree.left, nodes);
    }
    if (tree.node.type == 'constant' || tree.node.type == 'variable') {
        nodes.push(tree);
    }
    if (tree.right && !operations[tree.node.token].distrib) {
        collectSubTreeTerms(tree.right, nodes);
    }
}

function calculateNode(node, nodes) {
    var parentNode = node.parent;
    var left = node.left;
    var right = node.right;
    var newTerm = operations[node.node.token].pred(left.node, right.node);

    newTerm.node = right;
    newTerm.fixedNode = left;
    newTerm.side = 'left';
    if (!newTerm.complete) { 
        newTerm = searchTerms(node.node.token, right, left, 'left');
    }
    if (!newTerm.complete) {
        newTerm = searchTerms(node.node.token, left, right, 'right');
    }
    if (newTerm.complete) {
        var replace = replaceNodes(newTerm, node);
        var replaced;
        if (replace) {
            nodes[0][0] = replace;
            replaced = [];
            replaced.push(node.node);
            replaced.push(newTerm.node.node);
            replaced.push(newTerm.fixedNode.node);
        }
        return replaced ? replaced : false;
    }
}

function copyBranch(branch, newTree) {
    if (!branch) {
        return branch;
    }
    var newBranch = new BinaryNode(branch.node, newTree, null, null);
    newBranch.left = copyBranch(branch.left, newBranch);
    newBranch.right = copyBranch(branch.right, newBranch);
    return newBranch;
}

function searchTerms(operator, node, fixedNode, side) {
    var root;
    var visited = [node, fixedNode];
    var newTerm = {complete: false};
    var negate = (side == 'left' ? (operator == '-' ? true : false) : false);
    var parent = node.parent;
    while (!newTerm.complete) {
        if (!node.parent) {
            if (node == root) {
                break;
            }
            root = node;
        }
        if (node.node.type == 'operator' && operations[node.node.token].distrib) {
            break;
        }
        if (node.node.type == 'operator' && node.node.token == '-' && node != parent) {
            negate = !negate;
        }
        if (node.left && visited.indexOf(node.left) == -1) {
            node = node.left;
            visited.push(node);
        } else if (node.right && visited.indexOf(node.right) == -1) {
            node = node.right;
            visited.push(node)
        } else if (node.parent) {
            //Can't go down, so go up
            node = node.parent;
            visited.push(node);
        }
        if (side == 'left') {
            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
                newTerm = operations[operator].pred(fixedNode.node, operations['*'].pred(node.node, new Term('-1', 0, 'constant', -1)).result);
            } else {
                newTerm = operations[operator].pred(fixedNode.node, node.node);
            }
            
        } else {
            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
                newTerm = operations[operator].pred(fixedNode.node, operations['*'].pred(node.node, new Term('-1', 0, 'constant', -1)).result);
            } else {
                newTerm = operations[operator].pred(fixedNode.node, node.node);
            }
        }
        
    }
    newTerm.node = node;
    newTerm.fixedNode = fixedNode;
    newTerm.side = side;
    return newTerm;
}

function replaceNodes(newTerm, parent) {
    //CLONE TREE HERE
    var newNode = new utility.BinaryNode(newTerm.result, parent, null, null);
    var node = newTerm.node;
    var fixedNode = newTerm.fixedNode;
    var side = newTerm.side;
    if (parent.parent) {
        parent[side] = newNode;
        if (node.parent && node.parent.parent) {
            if (node.parent.parent.left == node.parent) {
                if (node.parent.left == node) {
                    node.parent.parent.left = node.parent.right;
                    node.parent.right.parent = node.parent.parent;
                    node.parent.left = null;
                } else {
                    node.parent.parent.left = node.parent.left;
                    node.parent.left.parent = node.parent.parent;
                    node.parent.right = null;
                }
            } else {
                if (node.parent.left == node) {
                    node.parent.parent.right = node.parent.right;
                    node.parent.right.parent = node.parent.parent;
                    node.parent.left = null;
                } else {
                    node.parent.parent.right = node.parent.left;
                    node.parent.left.parent = node.parent.parent;
                    node.parent.right = null;
                }
            }
        } else {
            if (node.parent.left == node) {
                node.parent.right.parent = null;
                return node.parent.right;                
            } else {              
                node.parent.left.parent = null;
                return node.parent.left;                
            }
        }
    } else {
        return newNode;
    }
    var root = newNode;
    while (root.parent) {
        root = root.parent;
    } 
    return root;
}