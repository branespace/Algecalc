var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Constant on constant addition
    if (a.type == 'constant' && b.type == 'constant') {
        //Get the two values and add them
        var answer = a.value + b.value;

        //Create new token object for result
        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
        result.complete = true;
    
    //Variable on variable addition
    }  else if (a.type == 'variable' && b.type == 'variable') {
        
        //For each symbol
        for (var i = 0; i < a.symbol.length; i++) {
            //Check for symbol match. Symbols WILL be sorted
            if (a.symbol[i] != b.symbol[i]) {
                return result;
            }
            //Check for power match
            if (a.power[i] != b.power[i]) {
                return result;
            }
            
            //The only change is the added coefficients
            var answer = a.coefficient + b.coefficient;

            //Coefficients equal 0
            if (answer == 0) {
                //Convert variable to constant and return
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

module.exports = new Operation('+', 5, 'left', false, predicate, '-', true);