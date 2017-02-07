var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Constant on constant exponentiation
    if (a.type == 'constant' && b.type == 'constant') {
        //Get the two values and calculcate
        var answer = Math.pow(a.value, b.value);

        //Create new token object for result
        result.result = new Term('', a.parenLevel, 'constant', answer);
        result.complete = true;
    }
    //Return token object
    return result;
};

module.exports = new Operation('^', 3, 'right', true, predicate);