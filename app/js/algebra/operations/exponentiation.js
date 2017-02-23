var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Constant on constant exponentiation
    if (a.type == 'constant' && b.type == 'constant') {
        var answer = Math.pow(a.value, b.value);

        result.result = new Term('', a.parenLevel, 'constant', answer);
        result.complete = true;
    }
    return result;
};

module.exports = new Operation('^', 3, 'right', 'left', predicate);