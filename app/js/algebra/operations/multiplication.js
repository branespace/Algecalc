var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Constant on constant multiplication
    if (a.type == 'constant' && b.type == 'constant') {
        //Get the two value and multiply them
        var answer = a.value * b.value;

        //Create new token object for result
        result.result = new Term('', a.parenLevel, 'constant', answer);
        result.complete = true;
    } else if ((a.type == 'constant' || b.type == 'constant') && (a.type == 'variable' || b.type =='variable') && (a.type != b.type)) {
        if (a.type == 'variable') {
            var variable = a;
            var constant = b;
        } else {
            var variable = b;
            var constant = a;
        }
        var answer = variable.coefficient * constant.value;
        result.result = new Term('', a.parenLevel, 'variable', answer, variable.symbol, variable.power);
        result.complete = true;
    } else if (a.type == 'variable' && b.type == 'variable') {
        var answer = a.coefficient * b.coefficient;
        if (answer == 0) {
            result.result = new Term('', a.parenLevel, 'constant', 0);
            result.complete == true;
        } else {
            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });
            var power = [];
            for (var i = 0; i < symbol.length; i++) {
                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) + (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
            }
            result.result = new Term('', a.parenLevel, 'variable', answer, symbol, power);
            result.complete = true;
        }
    }

    //Return token object
    return result;
};

module.exports = new Operation('*', 4, 'left', true, predicate);