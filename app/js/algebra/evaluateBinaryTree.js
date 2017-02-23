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

    //Converts the tree to 2-d array of nodes
    utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree));
    for (var i = nodes.length - 1; i >= 0; i--) {
        //No nodes at this level, so skip
        if (!nodes[i]) { continue; }
        for (var k = 0; k < nodes[i].length; k++) {
            for (var j = 0; j <= operations.maxPreced; j++) {
                var node = nodes[i][k];  
                //Operator and correct precedence            
                if (node.node.type == 'operator' && operations[node.node.token].preced == j) {
                    //Non-distributive operation
                    if (!operations[node.node.token].distrib) {
                        //Recursively copy tree
                        treeCopy = utility.copyBranch(tree);
                        //Attempt to calculate value
                        result = calculateNode(node, nodes);

                        if (result) {
                            //Successfuly calculated, so reroot tree
                            tree = nodes[0][0];
                            steps.push({tree: treeCopy, nodes: result});
                            nodes = [];
                            utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree)); 

                            //Janky restart processing
                            i = nodes.length - 1;
                            k = 0;
                            j = -1;                                  
                        }      
                    } else if (operations[node.node.token].distrib && operations[node.node.token].assoc == 'left') {
                        var lhs = [],
                            rhs = [];

                        //Collects all potential terms for distribution on both sides
                        utility.collectSubTreeTerms(node.left, lhs, false, operations);
                        utility.collectSubTreeTerms(node.right, rhs, false, operations);
                        if (lhs.length == 1 && rhs.length == 1) {
                            //Single node, so copy the tree and attempt calculation
                            treeCopy = utility.copyBranch(tree);   
                            result = calculateNode(node, nodes);                   

                            if (result) {
                                //Reroot tree
                                tree = nodes[0][0];

                                steps.push({tree: treeCopy, nodes: result});
                                nodes = [];
                                utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree)); 

                                //Janky restart processing
                                i = nodes.length - 1;
                                k = 0;
                                j = -1;                                  
                            }                    
                        } else if (operations[node.node.token].distrib == 'both') {
                            //Distribution (LHS and or RHS non zero) and bimodal
                            var expr = [];
                            for (var leftOperand = 0; leftOperand < lhs.length; leftOperand++) {
                                for (var rightOperand = 0; rightOperand < rhs.length; rightOperand++) {
                                    //If not the first value, addition
                                    if (leftOperand != 0 || rightOperand != 0) {
                                        expr.push(new Term('+', node.node.parenLevel, 'operator'));
                                    }

                                    //If we're behind a negation operator, negate values
                                    if (lhs[leftOperand].neg) {
                                        lhs[leftOperand] = operations['*'].pred(lhs[leftOperand], new Term('-1', les[leftOperand].node.parenLevel, 'constant', -1));
                                        lhs[leftOperand].neg = false;
                                    }
                                    if (rhs[rightOperand].neg) {
                                        rhs[rightOperand] = operations['*'].pred(rhs[rightOperand], new Term('-1', rhs[rightOperand].node.parenLevel, 'constant', -1));
                                        rhs[rightOperand].neg = false
                                    }                                    
                                    
                                    //Add multiplication terms and set parenLevel to that of the operator
                                    expr.push(lhs[leftOperand].node);
                                    expr.push(new Term('*', node.node.parenLevel, 'operator'));
                                    expr.push(rhs[rightOperand].node);
                                    lhs[leftOperand].node.parenLevel = node.node.parenLevel;
                                    rhs[rightOperand].node.parenLevel = node.node.parenLevel;
                                }
                            }
                            
                            //Convert to postfix and then to a new subtree
                            var postfixExpr = tokenToPostfix(expr);
                            var subTree = postfixToTree(postfixExpr);

                            //Add subtree to parent of operator, or store as new root
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
                            utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree));

                            //Janky restart processing
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

//Calculate values of an operator node
function calculateNode(node, nodes) {
    var parentNode = node.parent;
    var left = node.left;
    var right = node.right;
    var newTerm = operations[node.node.token].pred(left.node, right.node);

    //Set fixed and selection node
    newTerm.node = right;
    newTerm.fixedNode = left;
    newTerm.side = 'left';

    //Switch nodes
    if (!newTerm.complete) { 
        newTerm = searchTerms(node.node.token, right, left, 'left');
    }
    //Switch sides
    if (!newTerm.complete) {
        newTerm = searchTerms(node.node.token, left, right, 'right');
    }

    //Did we find a match?
    if (newTerm.complete) {
        var replace = replaceNodes(newTerm, node);
        var replaced;
        if (replace) {
            //Successfully replaced nodes
            if (nodes[0]) {
                nodes[0][0] = replace;
            } else {
                nodes[0] = [replace];
            }
            //Store replaced values
            replaced = [];
            replaced.push(node.node);
            replaced.push(newTerm.node.node);
            replaced.push(newTerm.fixedNode.node);
        }
        return replaced ? replaced : false;
    }
}

//Find functional operator terms
function searchTerms(operator, node, fixedNode, side) {
    var root;
    var visited = [node, fixedNode];
    var newTerm = {complete: false};
    var negate = (side == 'left' ? (operator == '-' ? true : false) : false);
    var parent = node.parent;
    var start = node;
    var searchSide = 'left', 
        above = false;
    while (!newTerm.complete) {
        //Loop until we have a term or break

        if (!node.parent) {
            //Hit the root
            if (node == root) {
                //We've been here before, so we should stop
                break;
            }
            //Mark our root as visited
            root = node;
        }

        //Break on distributive operator: we can't go past those
        if (node.node.type == 'operator' && operations[node.node.token].distrib) {
            break;
        }

        //Invert our negation flag.  Node != parent flag makes sure we don't double count
        if (node.node.type == 'operator' && node.node.token == '-' && node != parent) {
            negate = !negate;
        }

        //We have a left node that we haven't visited
        if (node.left && visited.indexOf(node.left) == -1) {
            //Move to the node and mark as seen
            node = node.left;
            visited.push(node);

        //Maybe we have a right node that we haven't visited
        } else if (node.right && visited.indexOf(node.right) == -1) {
            //Move to the node and mark as seen
            node = node.right;
            visited.push(node)

        //We have no children unvisited, so we go up the tree
        } else if (node.parent) {
            
            node = node.parent;
            if (node == start && !above) {
                //Returned to start from below, so mark as complete and check the other side
                searchSide = 'right';
                above = true;
            } else if (node == start && above) {
                //Returned to initial node the second time, so switch sides
                if (start.parent.left == start) {
                    searchSide = 'right';
                } else {
                    searchSide = 'left'
                }
            }
            visited.push(node);
        }
        //Process operator on viable operand, negating as necessary, and watching how / is not commutative
        if (searchSide == 'right') {
            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
                newTerm = operations[operator].pred(fixedNode.node, operations['*'].pred(node.node, new Term('-1', node.node.parenLevel, 'constant', -1)).result);
            } else {
                newTerm = operations[operator].pred(fixedNode.node, node.node);
            }
        } else {       
            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
                newTerm = operations[operator].pred(node.node, operations['*'].pred(fixedNode.node, new Term('-1', node.node.parenLevel, 'constant', -1)).result);
            } else {
                newTerm = operations[operator].pred(node.node, fixedNode.node);
            }
        }
        newTerm.side = side;
    }
    newTerm.node = node;
    newTerm.fixedNode = fixedNode;
    newTerm.side = side;
    return newTerm;
}

//Swap tree nodes to remove replaced values
function replaceNodes(newTerm, parent) {
    var newNode = new utility.BinaryNode(newTerm.result, parent, null, null);
    var node = newTerm.node;
    var fixedNode = newTerm.fixedNode;
    var side = newTerm.side;
    if (parent.parent) {
        //Parent is not the root
        parent[side] = newNode;
        if (node.parent && node.parent.parent) {
            //For each set of left/right for superparent and parent
            //  Set parenLevel of replacing node
            //  Replace parent node
            //  Correct parent of node
            //  Clean up references
            if (node.parent.parent.left == node.parent) {
                if (node.parent.left == node) {
                    node.parent.right.node.parenLevel = node.parent.node.parenLevel;
                    node.parent.parent.left = node.parent.right;
                    node.parent.right.parent = node.parent.parent;
                    node.parent.left = null;
                } else {
                    node.parent.left.node.parenLevel = node.parent.node.parenLevel;
                    node.parent.parent.left = node.parent.left;
                    node.parent.left.parent = node.parent.parent;
                    node.parent.right = null;
                }
            } else {
                if (node.parent.left == node) {
                    node.parent.right.node.parenLevel = node.parent.node.parenLevel;                    
                    node.parent.parent.right = node.parent.right;
                    node.parent.right.parent = node.parent.parent;
                    node.parent.left = null;
                } else {
                    node.parent.left.node.parenLevel = node.parent.node.parenLevel;
                    node.parent.parent.right = node.parent.left;
                    node.parent.left.parent = node.parent.parent;
                    node.parent.right = null;
                }
            }
        } else {
            //Parent lacks a parent
            if (node.parent.left == node) {
                node.parent.right.parent = null;
                return node.parent.right;                
            } else {              
                node.parent.left.parent = null;
                return node.parent.left;                
            }
        }
    } else {
        //Replacing root
        return newNode;
    }

    //Reroot tree
    var root = newNode;
    while (root.parent) {
        root = root.parent;
    } 
    return root;
}