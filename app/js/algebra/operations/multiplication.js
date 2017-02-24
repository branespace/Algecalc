var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Constant on constant multiplication
    if (a.type == 'constant' && b.type == 'constant') {
        var answer = a.value * b.value;

        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
        result.complete = true;

    //Constant on variable multiplication
    } else if ((a.type == 'constant' || b.type == 'constant') && (a.type == 'variable' || b.type =='variable') && (a.type != b.type)) {
        if (a.type == 'variable') {
            var variable = a;
            var constant = b;
        } else {
            var variable = b;
            var constant = a;
        }

        var answer = variable.coefficient * constant.value;
        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, variable.symbol, variable.power);
        result.complete = true;

    //Variable on variable multiplication
    } else if (a.type == 'variable' && b.type == 'variable') {
        var answer = a.coefficient * b.coefficient;

        //0 coefficient
        if (answer == 0) {
            //Return a constant
            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
            result.complete == true;

        //Non-zero coefficient
        } else {
            //Combine symbols, removing duplicates
            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });

            //For each symbol in a or b, return 0 or the power if found, and then add
            var power = [];
            for (var i = 0; i < symbol.length; i++) {
                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) + (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
            }

            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, symbol, power);
            result.complete = true;
        }
    }
    return result;
};

module.exports = new Operation('*', 4, 'left', 'both', predicate, '/');