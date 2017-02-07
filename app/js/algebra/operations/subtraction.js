var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};
    //Constant on constant subtraction

    if (a.type == 'constant' && b.type == 'constant') {
        //Get the two value and subtract them
        var answer = a.value - b.value;
        //Create new token object for result
        result.result = new Term('', a.parenLevel, 'constant', answer);
        result.complete = true;

    } else if (a.type == 'variable' && b.type == 'variable') {
        for (var i = 0; i < a.symbol.length; i++) {
            if (a.symbol[i] != b.symbol[i]) {
                return result;
            }
            if (a.power[i] != b.power[i]) {
                return result;
            }
            var answer = a.coefficient - b.coefficient;
            if (answer == 0) {
                result.result = new Term('', a.parenLevel, 'constant', 0);
                result.complete = true;
                return result;
            }
            result.result = new Term('', a.parenLevel, 'variable', answer, a.symbol, a.power);
            result.complete = true;
        }
    }
    //Return token object
    return result;
};

module.exports = new Operation('-', 5, 'left', false, predicate);