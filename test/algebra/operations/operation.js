var chai = require('chai');
var expect = chai.expect;

var operation = require('./../../../app/js/algebra/operations/operation.js');

var token = '+',
    prece = 5,
    assoc = 'left',
    distr = false,
    predi = function() { return false; };

describe('operation', function() {
    it('should assign all values correctly', function() {
        var result = new operation(token, prece, assoc, distr, predi);
        expect(result.token).to.equal(token);
        expect(result.preced).to.equal(prece);
        expect(result.assoc).to.equal(assoc);
        expect(result.distrib).to.equal(distr);
        expect(result.pred).to.equal(predi);
    });
});