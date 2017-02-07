var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    if ((b.hasOwnProperty('value') && b.value == 0) || (b.hasOwnProperty('coefficient') && b.coefficient == 0)) {
        result.error = 'division by 0 error';
        return result;
    }

    //Constant on constant division
    if (a.type == 'constant' && b.type == 'constant') {
        //Get the two value and multiply them
        var answer = a.value / b.value;

        //Create new token object for result
        result.result = new Term('', a.parenLevel, 'constant', answer);
        result.complete = true;
    } else if (a.type == 'constant' && b.type == 'variable') {
        var answer = a.value / b.coefficient;
        result.result = new Term('', a.parenLevel, 'variable', answer, b.symbol, b.power.map(function(val) { return val * -1; }));
        result.complete = true;
    } else if (a.type == 'variable' && b.type == 'constant') {
        var answer = a.coefficient / b.value;
        result.result = new Term('', a.parenLevel, 'variable', answer, a.symbol, a.power);
        result.complete = true;        
    } else if (a.type == 'variable' && b.type == 'variable') {
        var answer = a.coefficient / b.coefficient;
        if (answer == 0) {
            result.result = new Term('', a.parenLevel, 'constant', 0);
            result.complete == true;
        } else {
            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });
            var power = [];
            for (var i = 0; i < symbol.length; i++) {
                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) - (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
            }
            result.result = new Term('', a.parenLevel, 'variable', answer, symbol, power);
            result.complete = true;
        }
    }
    return result;
};

module.exports = new Operation('/', 4, 'left', true, predicate);