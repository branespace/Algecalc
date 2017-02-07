module.exports = function Operation(token, precedence, associativity, distribution, predicate) {
    this.token = token;
    this.preced = precedence;
    this.assoc = associativity;
    this.distrib = distribution;
    this.pred = predicate;
};