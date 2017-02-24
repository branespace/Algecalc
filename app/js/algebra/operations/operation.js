module.exports = function Operation(token, precedence, associativity, distribution, predicate, inverse, negateInverse) {
    this.token = token;
    this.preced = precedence;
    this.assoc = associativity;
    this.distrib = distribution;
    this.pred = predicate;
    this.inverse = inverse;
    this.negInverse = negateInverse;
};