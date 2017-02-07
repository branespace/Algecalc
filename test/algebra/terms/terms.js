var chai = require('chai');
var expect = chai.expect;

var Terms = require('./../../../app/js/algebra/terms/terms.js');

describe('terms', function() {
    it('should identify operators', function() {
        expect(Terms.fromToken('+', 0).type).to.equal('operator');
        expect(Terms.fromToken('*', 0).type).to.equal('operator');
        expect(Terms.fromToken('%', 0).type).to.equal('operator');
    });
    it('should identify parens', function() {
        expect(Terms.fromToken('(', 0).type).to.equal('parenthesis');
        expect(Terms.fromToken(')', 0).type).to.equal('parenthesis');
    });
    it('should correctly evaluate constants', function() {
        expect(Terms.fromToken('1', 0).value).to.equal(1);
        expect(Terms.fromToken('0', 0).value).to.equal(0);
        expect(Terms.fromToken('-1', 0).value).to.equal(-1);
        expect(Terms.fromToken('-0', 0).value).to.equal(0);
        expect(Terms.fromToken('1.2', 0).value).to.equal(1.2);
    });
    it('should correctly evaluate variables', function() {
        expect(Terms.fromToken('x', 0).token).to.equal('x');
        expect(Terms.fromToken('1x', 0).token).to.equal('x');
        expect(Terms.fromToken('0x', 0).token).to.equal('0');
        expect(Terms.fromToken('-x', 0).token).to.equal('-x');
        expect(Terms.fromToken('x^2', 0).token).to.equal('x^2');
        expect(Terms.fromToken('xy', 0).token).to.equal('xy');
        expect(Terms.fromToken('yx', 0).token).to.equal('xy');
        expect(Terms.fromToken('x^2y', 0).token).to.equal('x^2y');
        expect(Terms.fromToken('xy^2', 0).token).to.equal('xy^2');
    });        
});