var operations = {};

operations['+'] = require('./addition.js');
operations['-'] = require('./subtraction.js');
operations['*'] = require('./multiplication.js');
operations['/'] = require('./division');
operations['^'] = require('./exponentiation');
operations['%'] = require('./modulus');

module.exports = (function() {

    //Get operator counts and maximum precidence value
    var operArray = Object.keys(operations);
    operations.count = operArray.length;
    operations.maxPreced = operArray.reduce(function(acc, val) {
        if(typeof operations[val] == 'function') {
            return acc;
        }
        return Math.max(acc, operations[val].preced);
        }, 0);
    return operations;
})();