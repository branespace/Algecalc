var utility = {};

//Sorts an array, keeping a second array associations
utility.sortArraysTogether = function (a, b, predicate) {
    var list = [];

    //Add array items to object pairs and push to array
    for (var i in a) {
        list.push({a: a[i], b: b[i]});
    }

    //Sort by predicate, or alpha sort if no predicate
    if (!predicate) {
        list.sort(function(a, b) { return a.a == b.a ? 0 : +(a.a > b.a) || -1;} );
    } else {
        list.sort(predicate);
    }

    //Move items back into seperate arrays
    for (var i in list) {
        a[i] = list[i].a;
        b[i] = list[i].b;
    }

    return {a: a, b: b};
}

//BinaryNode constructor function
utility.BinaryNode = BinaryNode;
function BinaryNode(node, parent, left, right) {
    this.node = node;
    this.left = left ? left : null;
    this.right = right ? right : null;
    this.parent = parent ? parent : null;
}

//Converts a binary tree into a two dimensional array by depth of tree
utility.flattenTree = function flattenTree(tree, nodes, level, depth) {
    if (tree.left) {
        flattenTree(tree.left, nodes, level + 1, depth);
    }
    if (!nodes[level + tree.node.parenLevel * depth]) {
        nodes[level + tree.node.parenLevel * depth] = [];
    }
    nodes[level + tree.node.parenLevel * depth].push(tree);
    if (tree.right) {
        flattenTree(tree.right, nodes, level + 1, depth);
    }
}

//Gets the depth of the tree
utility.treeDepth = function treeDepth(tree, depth) {
    depth = depth || 0;

    //Get left side depth
    var left = tree.left ? utility.treeDepth(tree.left, depth + 1) : 0;

    //Get right side depth
    var right = tree.right ? utility.treeDepth(tree.right, depth + 1) : 0;

    //Return deepest side depth
    return Math.max(left, right, depth);
}

//Collect terms down one branch of tree
utility.collectSubTreeTerms = function collectSubTreeTerms(tree, nodes, negate, operations) {
    negate = negate || false;
    if (tree.left && !operations[tree.node.token].distrib) {
        utility.collectSubTreeTerms(tree.left, nodes, negate, operations);
    }
    if (tree.node.type == 'constant' || tree.node.type == 'variable') {
        if (negate) {
            tree.neg = true;
        }
        nodes.push(tree);
    }
    if (tree.node.type == 'operator' && tree.node.token == '-') {
        negate = !negate;
    }
    if (tree.right && !operations[tree.node.token].distrib) {
        utility.collectSubTreeTerms(tree.right, nodes, negate, operations);
    }
};

//Copies a subtree recursively, replacing nodes but maintaining values
utility.copyBranch = function copyBranch(branch, newTree) {
    if (!branch) {
        return branch;
    }
    var newBranch = new BinaryNode(branch.node, newTree, null, null);
    newBranch.left = utility.copyBranch(branch.left, newBranch);
    newBranch.right = utility.copyBranch(branch.right, newBranch);
    return newBranch;
};

utility.tidyExpr = function tidyExpr(val, index, arr) {
    var tokenOut, negate;
//Delimiter support for expressions (s.a. colorization and MathJax support)
var delim = {
        open: '',  //Start of expression
        close: '', //End of expression
        highlight: '<span style="color: #ff0000">', //Start of highlighted section
        highlightEnd: '</span>'                     //End of highlighted section
    };
    tokenOut = val.token;

    if (val.type == 'operator' && val.token == '+')  {
        if (arr.length > index + 1) {
            if (arr[index + 1].type == 'constant') {
                if (arr[index + 1].value < 0) {
                    arr[index + 1].value = 0 - arr[index + 1].value;
                    arr[index + 1].genToken(); 
                    arr[index + 1].flip = true;
                    tokenOut = '-';
                }
            } else if (arr[index + 1].type == 'variable') {
                if (arr[index + 1].coefficient < 0) {
                    arr[index + 1].coefficient = 0 - arr[index + 1].coefficient;
                    arr[index + 1].genToken();
                    arr[index + 1].flip = true;
                    tokenOut = '-';
                }
            }
        }
    } else if (val.type == 'operator' && val.token == '-')  {
        if (arr.length > index + 1) {
            if (arr[index + 1].type == 'constant') {
                if (arr[index + 1].value < 0) {
                    arr[index + 1].value = 0 - arr[index + 1].value;
                    arr[index + 1].genToken(); 
                    arr[index + 1].flip = true;
                    tokenOut = '+';
                }
            } else if (arr[index + 1].type == 'variable') {
                if (arr[index + 1].coefficient < 0) {
                    arr[index + 1].coefficient = 0 - arr[index + 1].coefficient;
                    arr[index + 1].genToken();
                    arr[index + 1].flip = true;
                    tokenOut = '+';
                }
            }
        }
    }
    if (val.hasOwnProperty('flip') && val.flip) {
        if (val.type == 'constant') {
            val.value = 0 - val.value;
            val.genToken(); 
            val.flip = false;
        } else if (val.type == 'variable') {
            val.coefficient = 0 - val.coefficient;
            val.genToken();
            val.flip = false;
        }       
    }
    if (this.indexOf(val) > -1) {
        tokenOut = delim.highlight + tokenOut + delim.highlightEnd;
        this.splice(this.indexOf(val), 1);
    } 
    return tokenOut;
}

module.exports = utility;