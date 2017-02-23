var operations = require('./../operations/operations.js');
var utility = require('./../../utility/utility.js');
var Term = require('./term.js');

var Terms = {};

module.exports = Terms;

//Generate a new term from token
Terms.fromToken = function(token, parenLevel) {
    var term;

    //Check for operator in operations list
    if (operations.hasOwnProperty(token)) {
        term = new Term(token, parenLevel, 'operator');

    //Check for parentheses
    } else if (token == '(' || token == ')') {
        term = new Term(token, parenLevel, 'parenthesis');

    //Not operator or paren, so SHOULD be term
    } else {
        //Try to match it to simple number
        var match = token.trim().match(/^(-?)(\d*),?(\d+)(\.)?(\d*)(e?)(\d*)?$/);
        if (match) {
            var tokenBuilder = '';
            for (var i = 1; i < match.length; i++) {
                tokenBuilder += match[i] ? match[i] : '';
            }
            var value = parseFloat(tokenBuilder, 10);
            term = new Term(token, parenLevel, 'constant', value);
        } else {
            //Didn't match, so maybe a variable?
            match = token.trim().match(/^(-?)(\d*),?(\d+)?(\.)?(\d*)(e?)(\d*)?([a-zA-Z])\^?(\d*)?/);
            if (match) { 
                var tokenBuilder = '';
                var symbol = [];
                var power = [];
                for (var i = 1; i < 7; i++) {
                    tokenBuilder += match[i] ? match[i] : '';
                }
                var coefficient;
                if (tokenBuilder.length == 0) {
                    //No explicit coefficient, so add one
                    coefficient = 1;
                } else {
                    //Correct negative sign if negative, or get the coefficient if not just a negative sign
                    coefficient = (tokenBuilder == '-' ? -1 : parseFloat(tokenBuilder, 10));
                }
                if (coefficient == 0 ) {
                    //Coefficient is 0, so we have a constant, really
                    term = new Term('0', parenLevel, 'constant', 0);
                } else {
                    symbol.push(match[8]);
                    power.push(match[9] ? parseFloat(match[9], 10) : 1);
                    var remaining = /([a-zA-Z])\^?(\d*)/g,
                        match;
                    //Iterate over matches, adding symbols and optional powers to term
                    while ((match = remaining.exec(token)) != null) {
                        if (match[1] != symbol[0] && (match[2] ? match[2] != 0 : true)) {
                            symbol.push(match[1]);
                            power.push(match[2] ? parseFloat(match[2], 10) : 1);
                        }
                    }

                    //Sort our symbols, keeping powers associated
                    var sortedArrays = utility.sortArraysTogether(symbol, power);
                    term = new Term(tokenBuilder, parenLevel, 'variable', coefficient, sortedArrays.a, sortedArrays.b);
                }
            }
        }
    }
    
    return term;   
};