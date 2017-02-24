var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Check for a zero term and abort
    if ((b.hasOwnProperty('value') && b.value == 0) || (b.hasOwnProperty('coefficient') && b.coefficient == 0)) {
        result.error = 'division by 0 error';
        return result;
    }

    //Constant on constant division
    if (a.type == 'constant' && b.type == 'constant') {
        var answer = a.value / b.value;

        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
        result.complete = true;

    //Constant divided by variable
    } else if (a.type == 'constant' && b.type == 'variable') {
        var answer = a.value / b.coefficient;

        //Also ensure that the powers are now negative
        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, b.symbol, b.power.map(function(val) { return val * -1; }));
        result.complete = true;

    //Variable divided by constant
    } else if (a.type == 'variable' && b.type == 'constant') {
        var answer = a.coefficient / b.value;

        //Same case as above, but since variable is on top, powers are unchanged
        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, a.symbol, a.power);
        result.complete = true;        

    //Variable on variable division
    } else if (a.type == 'variable' && b.type == 'variable') {
        var answer = a.coefficient / b.coefficient;

        //0 coefficient
        if (answer == 0) {
            //Return will be a constant
            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
            result.complete == true;

        //Non-zero coefficient
        } else {
            //Concatenate symbols, with duplicate removal
            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });

            //Powers are subtracted
            var power = [];
            for (var i = 0; i < symbol.length; i++) {
                //          If the symbol is in a              get symbol                                   if the symbol is in be             get symbol
                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) - (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
            }

            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, symbol, power);
            result.complete = true;
        }
    }
    return result;
};

module.exports = new Operation('/', 4, 'left', 'left', predicate, '*', false);