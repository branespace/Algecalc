var operations = require('./operations/operations');

//Takes in text and turns it into tokens for RPN processing
module.exports = function(text) {
    //Temporary string for building multi-digit numbers
    var builder = '';
    //Token output array
    var tokens = [],
        parenLevel = 0;

    //For each character in the text
    for (var i = 0; i < text.length; i++) {
        var token = text[i];

        //Check for a negative number.  Negative signs appear at the beginning of an expression or after an operator
        if (token == '-' && !builder.length && ( i == 0 || (tokens.length && (isOperator(tokens[tokens.length - 1].token) || (tokens[tokens.length - 1].type == 'parenthesis'))))) {
            //If it is a negative sign and not subtraction, add to our number builder
            if (tokens.length && tokens[tokens.length - 1].token == ')') {
                tokens.push({token: '+', type: 'operator', parenLevel: parenLevel});                    
            }
            if (i < text.length - 1 && text[i + 1] == '(') {
                tokens.push({token: '-1', type: 'constant', value: '-1', parenLevel: parenLevel});
                tokens.push({token: '*', type: 'operator', parenLevel: parenLevel + 1});                
            } else {
                builder += token;
            }
        //Check for a variable to a power
        } else if (token == '^' && builder.length && (builder.charCodeAt(builder.length - 1) >= 'a'.charCodeAt()) && (builder.charCodeAt(builder.length - 1) <= 'z'.charCodeAt())) {
            builder += token;
        //If we have an infix operator...
        } else if (isOperator(token)) {
            //Add existing number from builder to tokens, checking type of token
            if (builder.length) {
                tokens.push({token: builder, count: tokens.length, type: getTokenType(builder), parenLevel: parenLevel});
            }
            //Clear token builder
            builder = '';
            //Add our token to the token array and mark as operator
            
            if (token == '-' && i < text.length - 1 && text[ i + 1 ] == '(') {
                if (tokens.length) {
                    tokens.push({token: '+', type: 'operator', parenLevel: parenLevel});
                }
                tokens.push({token: '-1', type: 'constant', value: '-1', parenLevel: parenLevel});
                tokens.push({token: '*', type: 'operator', parenLevel: parenLevel + 1});
            } else {
                tokens.push({token: token, count: tokens.length, type: 'operator', parenLevel: parenLevel});
            }
        //If we have a number or letter...
        } else if (isAlpha(token) || token == '.') {
            //Add to our token builder.  We validate LATER
            builder += token;
        //On parentheses, add to token list
        } else if (token == '(') {
            //If we have anything in our buffer, add it with multiplication
            if (builder.length) {
                tokens.push({token: builder, count: tokens.length, type: getTokenType(builder), parenLevel: parenLevel});
                builder = '';
                tokens.push({token: '*', count: tokens.length, type: 'operator', parenLevel: parenLevel + 1});
            } else if (tokens.length && tokens[tokens.length - 1].token == ')') {
                tokens.push({token: '*', count: tokens.length, type: 'operator', parenLevel: parenLevel});
            }

            //Increment parenlevel
            parenLevel++;
            tokens.push({token: '(', count: tokens.length, type: 'parenthesis', parenLevel: parenLevel});
        //On closee parentheses, check for builder content first
        } else if (token == ')') {
            //If we have stuff in the builder, flush it to the token list and then add the parenthesis
            if (builder.length) {
                tokens.push({token: builder, count: tokens.length, type: getTokenType(builder), parenLevel: parenLevel});
                builder = '';
            }
            tokens.push({token: ')', count: tokens.length, type: 'parenthesis', parenLevel: parenLevel});
            //Now decrement parenlevel
            parenLevel--;
            if (i < text.length - 1 && isAlpha(text[i + 1])) {
                tokens.push({token: '*', count: tokens.length, type: 'operator', parenLevel: parenLevel});
            }
        }
    }

    //Finished with tokens, so if we have anything left in the builder, flush to tokens
    if (builder.length) {
        tokens.push({token: builder, count: tokens.length, type: getTokenType(builder), parenLevel: parenLevel});
    }

    //Iterate tokens and look for variables, to separate coefficients and symbols
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].type == 'constant') {
            tokens[i].value = parseFloat(tokens[i].token, 10);
        } else if (tokens[i].type == 'variable') {
            //Extract power, coefficients, and symbol
            var match = tokens[i].token.match(/^(-?\d+(?:,\d+)*(?:\.\d+(?:e\d+)?)?)?([a-zA-Z])\^?(\d*)?$/);
            tokens[i].symbol = [match[2]];
            if (!match[1]) {
                tokens[i].coefficient = 1;
            //Standard case, explicit coefficient
            } else {
                tokens[i].coefficient = (match[1] == '-' ? -1 : parseFloat(match[1], 10));
            }
            if (match[3]) {
                tokens[i].power = [match[3]];
            } else {
                tokens[i].power = [1];
            }
        }
    }
    //Send token array back
    return tokens;
};

//Checks to see if the value is a decimal number
function isNumber(text) {
        /* ^        beginning of line
           -?       optional negative sign
           \d+      one or more digits
           (,\d+)*  optional allowance for commas as thousands seperators
            (\.      decimal seperator
            \d+      one or more digits
             (e       exponentiation
              \d+      exponent digits
             )?       is optional (exponent)
            )?       is optional (decimal)
           $        end of line
        */
    return text.trim().search(/^-?\d+(,\d+)*(\.\d+(e\d+)?)?$/) > -1;
}

//Checks to see if the value is in the operator table
function isOperator(text) {
    return operations.hasOwnProperty(text.trim());
}

//Tries to identify if a value is a constant or a variable
function getTokenType(token) {
    if (isNumber(token)) {
        return 'constant';
    } else if (token.match(/^-?\d*(,\d+)*(\.\d+(e\d+)?)?[a-zA-Z]\^?\d*$/)) {
        /* ^        beginning of line
           -?       optional negative sign
           \d*      zero or more digits         <-DIFFERENT FROM CONSTANT
           (,\d+)*  optional allowance for commas as thousands seperators
            (\.      decimal seperator
            \d+      one or more digits
             (e       exponentiation
              \d+      exponent digits
             )?       is optional (exponent)
            )?       is optional (decimal)
           [a-z     character capture: a-z      <-DIFFERENT FROM CONSTANT
           A-Z]     character capture: A-Z      <-DIFFERENT FROM CONSTANT
           ^?       optional exponentiation
           \d*      optional exponent
           $        end of line
        */
        return 'variable';
    } else {
        return 'unknown';
    }
}

function isAlpha(character) {
    return character.search(/[0-9a-zA-Z]/) > -1;
}