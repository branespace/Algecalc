var chai = require('chai');
var expect = chai.expect;

var Term = require('./../../../app/js/algebra/terms/term.js');

var operation = require('./../../../app/js/algebra/operations/subtraction.js');

describe('subtraction', function() {
    it('should subtract constants', function() {
        expect(operation.pred(new Term('', 0, 'constant', 1), 
                              new Term('', 0, 'constant', 2)).result.value).to.equal(-1);
        expect(operation.pred(new Term('', 0, 'constant', -1), 
                              new Term('', 0, 'constant', -3)).result.value).to.equal(2);
    });    
    it('should not subtract a constant and a variable', function() {
        expect(operation.pred(new Term('', 0, 'constant', 1), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).complete).to.equal(false);
    });
    it('should not subtract disparate variables or powers', function() {
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [1]), 
                              new Term('', 0, 'variable', 1, ['y'], [1])).complete).to.equal(false);
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x', 'y'], [2, 1]), 
                              new Term('', 0, 'variable', 1, ['x', 'y'], [1, 2])).complete).to.equal(false);
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [2]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).complete).to.equal(false);                                                            
    });
    it('should subtract variables', function() {
        expect(operation.pred(new Term('', 0, 'variable', 3, ['x'], [1]), 
                              new Term('', 0, 'variable', 2, ['x'], [1])).result.token).to.equal('x');
        expect(operation.pred(new Term('', 0, 'variable', 1, ['x'], [1]), 
                              new Term('', 0, 'variable', 1, ['x'], [1])).result.token).to.equal('0');                              
        expect(operation.pred(new Term('', 0, 'variable', 3, ['x', 'y'], [1, 1]), 
                              new Term('', 0, 'variable', 2, ['x', 'y'], [1, 1])).result.token).to.equal('xy');                                                                                                                                                    
        expect(operation.pred(new Term('', 0, 'variable', 3, ['x', 'y'], [1, 1]), 
                              new Term('', 0, 'variable', 2, ['y', 'x'], [1, 1])).result.token).to.equal('xy');    
    });            
});