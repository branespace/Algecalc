var chai = require('chai');
var expect = chai.expect;

var utility = require('./../../app/js/utility/utility.js');

describe('general', function() {
    describe('Sort Arrays Together', function() {
        it('should sort arrays together', function() {
            var a = ['a', 'c', 'b'];
            var b = [1, 3, 2];
            var result = utility.sortArraysTogether(a, b);
            expect(result.a).to.deep.equal(['a', 'b', 'c']);
            expect(result.b).to.deep.equal([1, 2, 3]);
        });
    });
});