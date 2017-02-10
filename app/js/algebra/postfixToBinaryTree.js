var utility = require('./../utility/utility.js');

module.exports = function(queue) {
    var stack = [];

    for (var i = 0; i < queue.length; i++) {
        var token = queue[i];
        
        if (token.type == 'constant' || token.type == 'variable') {
            stack.push(new utility.BinaryNode(token));
        } else if (token.type == 'operator') {
            var right = stack.pop();
            var left = stack.pop();
            var parent = new utility.BinaryNode(token, null, left, right);
            left.parent = parent;
            right.parent = parent;
            stack.push(parent);
        }

    }

    return stack[0];
};