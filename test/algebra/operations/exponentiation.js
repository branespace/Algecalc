var chai = require('chai');
var expect = chai.expect;

var Term = require('./../../../app/js/algebra/terms/term.js');

var operation = require('./../../../app/js/algebra/operations/exponentiation.js');

describe('exponentiation', function() {
    it('should exponentiate positive constants', function() {
        expect(operation.pred(new Term('', 0, 'constant', 4), 
                              new Term('', 0, 'constant', 2)).result.value).to.equal(16);
        expect(operation.pred(new Term('', 0, 'constant', 2), 
                              new Term('', 0, 'constant', -2)).result.value).to.equal(1/4);
        expect(operation.pred(new Term('', 0, 'constant', 4), 
                              new Term('', 0, 'constant', 0)).result.value).to.equal(1);
    });
    it('should not exponentiate a constant and a variable', function() {
        expect(operation.pred(new Term('', 0, 'constant', 1), 
                              new Term('', 0, 'variable', 2, ['x'], [1])).complete).to.equal(false);
    });    
});