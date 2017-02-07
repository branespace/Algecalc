var chai = require('chai');
var expect = chai.expect;

var Term = require('./../../../app/js/algebra/terms/term.js');

var operation = require('./../../../app/js/algebra/operations/division.js');

describe('division', function() {
    it('should divide constants', function() {
        expect(operation.pred(new Term('', 0, 'constant', 4), 
                              new Term('', 0, 'constant', 2)).result.value).to.equal(2);
        expect(operation.pred(new Term('', 0, 'constant', 2), 
                              new Term('', 0, 'constant', -1)).result.value).to.equal(-2);
    });    
    it('should divide a constant and a variable', function() {
        expect(operation.pred(new Term('', 0, 'constant', 2), 
                              new Term('', 0, 'variable', 2, ['x'], [1])).result.token).to.equal('x^-1');
        expect(operation.pred(new Term('', 0, 'variable', 2, ['x'], [1]), 
                              new Term('', 0, 'constant', 2)).result.token).to.equal('x');
    });
    it('should not divide by 0', function() {
        expect(operation.pred(new Term('', 0, 'constant', 4), 
                              new Term('', 0, 'constant', 0)).error).to.equal('division by 0 error');                              
        expect(operation.pred(new Term('', 0, 'constant', 2), 
                              new Term('', 0, 'variable', 0, ['x'], [1])).error).to.equal('division by 0 error');
        expect(operation.pred(new Term('', 0, 'variable', 2, ['x'], [1]), 
                              new Term('', 0, 'constant', 0)).error).to.equal('division by 0 error');
    });    
    it('should divide variables', function() {
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [1]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('1');
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [1]), 
                              new Term('', 0, 'variable', 1, ['y'], [1])).result.token).to.equal('xy^-1');
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x', 'y'], [1, 1]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('y');
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [2]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('x');                                                           
    });
});