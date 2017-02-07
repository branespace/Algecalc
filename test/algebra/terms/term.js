var chai = require('chai');
var expect = chai.expect;

var Term = require('./../../../app/js/algebra/terms/term.js');

describe('term', function() {
    it('should generate constant terms', function() {
        expect(new Term('15', 0, 'constant', 15).token).to.be.equal('15');
        expect(new Term('', 0, 'constant', 12).token).to.be.equal('12');
    });
    it('should generate tokens for variables', function() {
        var result = new Term('15x', 0, 'variable', 15, ['x'], [1]);
        expect(result.token).to.be.equal('15x');
        expect(result.symbol[0]).to.be.equal('x');
        expect(result.power[0]).to.be.equal(1);        
        expect(new Term('', 0, 'variable', 1, ['x'], [1]).token).to.be.equal('x');
        expect(new Term('', 0, 'variable', -1, ['x'], [1]).token).to.be.equal('-x');
        expect(new Term('', 0, 'variable', 5, ['x'], [1]).token).to.be.equal('5x');
        expect(new Term('', 0, 'variable', 1, ['x', 'y'], [1, 1]).token).to.be.equal('xy');
        expect(new Term('', 0, 'variable', 1, ['x'], [2]).token).to.be.equal('x^2');
        expect(new Term('', 0, 'variable', 1, ['x', 'y'], [2, 2]).token).to.be.equal('x^2y^2');
        expect(new Term('', 0, 'variable', 8, ['x'], [0]).token).to.be.equal('8');
    });             
});