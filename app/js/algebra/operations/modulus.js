var Operation = require('./operation.js');
var Term = require('./../terms/term.js');

var predicate = function(a, b) {
    var result = {complete: false};

    //Constant on constant modulus
    /*if (a.type == 'constant' && b.type == 'constant') {
        //Get the two values and mod them
        var answer = parseFloat(a.token, 10) % parseFloat(b.token, 10);

        //Create new token object for result
        result.result = {token: answer.toString(10), count: a.count, type: 'constant'};
        result.complete = true;
    } 
    */
    //Return token object
    return result;
};

module.exports = new Operation('%', 4, 'left', true, predicate);