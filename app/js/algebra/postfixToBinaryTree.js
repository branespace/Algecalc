var utility = require('./../utility/utility.js');

//Converts postfix tokens to a binary tree
module.exports = function(queue) {
    var stack = [];

    for (var i = 0; i < queue.length; i++) {
        var token = queue[i];
        
        //Push variables and constants onto the stack
        if (token.type == 'constant' || token.type == 'variable') {
            stack.push(new utility.BinaryNode(token));
        } else if (token.type == 'operator') {
            //On operators, get both the left and right operand
            var right = stack.pop();
            var left = stack.pop();

            //Build a new node with operands as children
            var parent = new utility.BinaryNode(token, null, left, right);

            //Link children to parent node
            left.parent = parent;
            right.parent = parent;

            //Put the new node on the stack
            stack.push(parent);
        }
    }

    return stack[0];
};