var chai = require('chai');
var expect = chai.expect;

var Term = require('./../../../app/js/algebra/terms/term.js');

var operation = require('./../../../app/js/algebra/operations/multiplication.js');

describe('multiplication', function() {
    it('should multiply constants', function() {
        expect(operation.pred(new Term('', 0, 'constant', 1), 
                              new Term('', 0, 'constant', 2)).result.value).to.equal(2);
        expect(operation.pred(new Term('', 0, 'constant', -1), 
                              new Term('', 0, 'constant', 2)).result.value).to.equal(-2);
    });    
    it('should multiply a constant and a variable', function() {
        expect(operation.pred(new Term('', 0, 'constant', 4), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('4x');
        expect(operation.pred(new Term('', 0, 'constant', 0), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('0');
    });
    it('should multiply variables', function() {
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [1]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('x^2');
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [1]), 
                              new Term('', 0, 'variable', 1, ['y'], [1])).result.token).to.equal('xy');
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x', 'y'], [1, 1]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('x^2y');   
    });            
});