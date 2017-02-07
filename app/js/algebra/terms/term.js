var utility = require('./../../utility/utility.js');

module.exports = Term;

function Term(token, parenLevel, type, value, symbol, power) {
    this.token = token;
    this.parenLevel = parenLevel;
    this.type = type;
    if (type == 'constant') {
        this.value = value;
    } else if (type == 'variable') {
        this.coefficient = value;
        this.symbol = symbol;
        this.power = power;
    }
    this.genToken();
};

Term.prototype.genToken = function() {
    if (this.type == 'constant') {
        this.token = this.value.toString(10);
    } else if (this.type == 'variable') {
        var sortedArrays = utility.sortArraysTogether(this.symbol, this.power);
        this.symbol = sortedArrays.a;
        this.power = sortedArrays.b;
        this.token = '';
        if (Math.abs(this.coefficient) == 0) {
            this.type = 'constant'
            this.symbol = null;
            this.token = '0';
            this.power = null;
            this.value = 0;
            return false;
        }
        if (Math.abs(this.coefficient) == 1) {
            this.token += this.coefficient < 0 ? '-' : '';
        } else {
            this.token += this.coefficient.toString(10);
        }
        for (var i = 0; i < this.symbol.length; i++) {
            if (this.power[i] == 0) {
                this.power.splice(i, 1);
                this.symbol.splice(i, 1);
                i--;
            } else {
                this.token += this.symbol[i];
                if (this.power[i] != 1) {
                    this.token += '^' + this.power[i].toString(10);
                }
            }
            if (this.symbol.length == 0) {
                this.type = 'constant';
                this.value = this.coefficient;
                this.token = this.value.toString(10);
                this.symbol = null;
                this.power = null;
                break;
            }
        }
    }
};