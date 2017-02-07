//Based on the Shunting Yard Algorithm - Dijkstra
var operations = require('./operations/operations.js');

module.exports = function tokenToPostfix(tokens) {
    var stack = [];
    var queue = [];
    var token;

    for (var i = 0; i < tokens.length; i++) {
        token = tokens[i];
        if (token.type == 'variable' || token.type == 'constant') {
            queue.push(token);
        } else if (token.type == 'function') {
            //Prepared for future operations
        } else if (token.type == 'operator') {
            while ((stack.length && stack[stack.length - 1].type == 'operator') && 
                   (( operations[token.token].assoc == 'left' && operations[token.token].preced >= operations[stack[stack.length - 1].token].preced ) || 
                    ( operations[token.token].assoc == 'right' && operations[token.token].preced > operations[stack[stack.length - 1].token].preced ))) {
                        queue.push(stack.pop());
            }
            stack.push(token);
        } else if (token.token == '(') {
            stack.push(token);
        } else if (token.token == ')') {
            while (stack.length && stack[stack.length - 1].token != '(') {
                queue.push(stack.pop());
            }
            if (!stack.length) {
                queue.error = 'mismatched parentheses';
                return queue;
            }
            if (stack[stack.length - 1].token == '(') {
                stack.pop();
                if (stack.length && stack[stack.length - 1].type == 'function') {
                    queue.push(stack.pop());
                }
            } 
        }
    }

    while (stack.length) {
        if (stack[stack.length - 1].type == 'parenthesis') {
            queue.error = 'mismatched parentheses';
            return queue;
        }
        queue.push(stack.pop());
    }

    return queue;
};