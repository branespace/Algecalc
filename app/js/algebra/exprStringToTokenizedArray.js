var operations = require('./operations/operations');
var Term = require('./terms/term.js');
var Terms = require('./terms/terms.js');

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
                tokens.push(new Term('+', 0, 'operator'));                    
            }
            if (i < text.length - 1 && text[i + 1] == '(') {
                tokens.push(new Term('-1', 0, 'constant', -1));
                tokens.push(new Term('*', 0, 'operator'));                
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
                tokens.push(Terms.fromToken(builder, 0));
            }
            //Clear token builder
            builder = '';
            //Add our token to the token array and mark as operator
            
            if (token == '-' && i < text.length - 1 && text[ i + 1 ] == '(') {
                if (tokens.length) {
                    tokens.push(new Term('+', 0, 'operator'));
                }
                tokens.push(new Term('-1', 0, 'constant', -1));
                tokens.push(new Term('*', 0, 'operator'));
            } else {
                tokens.push(new Term(token, 0, 'operator'));
            }
        //If we have a number or letter...
        } else if (isAlpha(token) || token == '.') {
            //Add to our token builder.  We validate LATER
            builder += token;
        //On parentheses, add to token list
        } else if (token == '(') {
            //If we have anything in our buffer, add it with multiplication
            if (builder.length) {
                tokens.push(Terms.fromToken(builder, 0));
                builder = '';
                tokens.push(new Term('*', 0, 'operator'));
            } else if (tokens.length && tokens[tokens.length - 1].token == ')') {
                tokens.push(new Term('*', 0, 'operator'));
            }

            //Increment parenlevel
            parenLevel++;
            tokens.push(new Term('(', 0, 'parenthesis'));
        //On closee parentheses, check for builder content first
        } else if (token == ')') {
            //If we have stuff in the builder, flush it to the token list and then add the parenthesis
            if (builder.length) {
                tokens.push(Terms.fromToken(builder, 0));
                builder = '';
            }
            tokens.push(new Term(')', 0, 'parenthesis'));
            //Now decrement parenlevel
            parenLevel--;
            if (i < text.length - 1 && isAlpha(text[i + 1])) {
                tokens.push(new Term('*', 0, 'operator'));
            }
        }
    }

    //Finished with tokens, so if we have anything left in the builder, flush to tokens
    if (builder.length) {
        tokens.push(Terms.fromToken(builder));
    }

    for (var i = 0; i < tokens.length - 2; i++) {
        if (tokens[i].type == 'operator' && tokens[i].token == '-') {
            if (tokens[i + 1].type == 'constant') {
                tokens[i + 1].value = 0 - tokens[i + 1].value;
            } else if (tokens[i + 1].type == 'variable') {
                tokens[i + 1].coefficient = 0 - tokens[i + 1].coefficient;
            }
            tokens[i + 1].genToken();
            tokens[i].token = '+';
        }
    }

    //Send token array back
    return tokens;
};

//Checks to see if the value is in the operator table
function isOperator(text) {
    return operations.hasOwnProperty(text.trim());
}

function isAlpha(character) {
    return character.search(/[0-9a-zA-Z]/) > -1;
}