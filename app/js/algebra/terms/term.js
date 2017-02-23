var utility = require('./../../utility/utility.js');

module.exports = Term;

//Constructor for new terms when all values are known
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

//Generates all tokens
Term.prototype.genToken = function() {
    //SETTINGS stub
    var settings = {algebra: {fix: 2}};

    if (this.type == 'constant') {
        //Check if constant is within error epsilon of an integer
        //EPSILON included since some browsers don't have it built in (*cough* IE)
	    if (Math.abs(this.value - Math.round(this.value)) < (Number.EPSILON || 2.2204460492503130808472633361816E-16)) {
            //Within EPSILON, so round off
            this.token = (Math.round(this.value)).toString(10);
        } else {
            //Not an integer, so set the decimal point
	        this.token = this.value.toFixed(settings.algebra.fix).toString(10);
        }
    } else if (this.type == 'variable') {
        //Sort symbol array, keeping associated power
        var sortedArrays = utility.sortArraysTogether(this.symbol, this.power);
        this.symbol = sortedArrays.a;
        this.power = sortedArrays.b;
        this.token = '';
        //0 coefficient is just a constant
        if (Math.abs(this.coefficient) == 0) {
            this.type = 'constant'
            this.symbol = null;
            this.token = '0';
            this.power = null;
            this.value = 0;
            return false;
        }

        //A coefficient of 1 should not be printed.  A -1 should be printed as a negative sign
        if (Math.abs(this.coefficient) == 1) {
            this.token += this.coefficient < 0 ? '-' : '';
        } else {
            //EPSILON floating point check.  EPSILON is included for sub-standard browsers
            if (Math.abs(this.coefficient - Math.round(this.coefficient)) < (Number.EPSILON || 2.2204460492503130808472633361816E-16)) {
                this.token += (Math.round(this.coefficient)).toString(10);
            } else {
                this.token += this.coefficient.toFixed(settings.algebra.fix).toString(10);
            }
        }
        for (var i = 0; i < this.symbol.length; i++) {
            //A term to the 0th power is 1, so just remove that symbol
            if (this.power[i] == 0) {
                this.power.splice(i, 1);
                this.symbol.splice(i, 1);

                //Back up one term
                i--;
            } else {
                this.token += this.symbol[i];
                if (this.power[i] != 1) {
                    this.token += '^' + this.power[i].toString(10);
                }
            }
            //If we got rid of all variables (0 power), reset to constant
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