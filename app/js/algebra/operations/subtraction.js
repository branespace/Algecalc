var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};
    //Constant on constant subtraction

    if (a.type == 'constant' && b.type == 'constant') {
        var answer = a.value - b.value;

        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
        result.complete = true;

    //Variable on variable subtraction
    } else if (a.type == 'variable' && b.type == 'variable') {
        for (var i = 0; i < a.symbol.length; i++) {
            //Check for symbol matches, and fail if not
            if (a.symbol[i] != b.symbol[i]) {
                return result;
            }

            //Check for power matches, and fail if not
            if (a.power[i] != b.power[i]) {
                return result;
            }
            var answer = a.coefficient - b.coefficient;

            //0 coefficient, so return a constant
            if (answer == 0) {
                result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
                result.complete = true;
                return result;
            }
            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, a.symbol, a.power);
            result.complete = true;
        }
    }
    return result;
};

module.exports = new Operation('-', 5, 'left', false, predicate, '+');