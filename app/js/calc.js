var submitButton,
    calcHistory,
    inputField,
    solutionCount = 0;  //Number of expressions solved

window.onload = function() {
    //Get handles for page controls
    submitButton = document.getElementById('submitButton');
    calcHistory = document.getElementById('calculationhistory');
    inputField = document.getElementById('inputBox');

    //Enable handlers for calculation (button click, enter pressed)
    submitButton.addEventListener('click', calculate);
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            calculate();
        }
    });
};

//Algebra calcuation module
var algebra = require('./algebra/algebra.js')

//List of enabled operations
var operations = algebra.operations;

//Delimiter support for expressions (s.a. colorization and MathJax support)
var delim = {
        open: '',  //Start of expression
        close: '', //End of expression
        highlight: '<span style="color: #ff0000">', //Start of highlighted section
        highlightEnd: '</span>'                     //End of highlighted section
    };

//Main calculation loop
var calculate = function() {
    var tokenizer = require('./algebra/exprStringToTokenizedArray.js');

    //Tokenize input
    var tokenArray = tokenizer(inputField.value);
    //Convert tokens to RPN expression
    var expr = tokenArray;//tokensToRPN(tokenArray.slice());
    //Error flag
    var error = false;

    //Create new output div element
    var answerDiv = document.createElement('div');
    answerDiv.className = 'solution ' + solutionCount;

    //TESTING
    var postfix = (require('./algebra/tokenToPostfix.js')(tokenArray.slice()));
    console.log(postfix.map(function(val){return val.token;}).join(' '));
    var binaryTree = (require('./algebra/postfixToBinaryTree.js')(postfix.slice()));
    console.dir(binaryTree);
    var tokenizedArray = (require('./algebra/binaryTreeToTokenizedArray.js')(binaryTree));
    console.log(tokenizedArray.map(function(val){return val.token}).join(' '));

    //Create and add expression and RPN string
    answerDiv.innerHTML += "<br />Expression: " + delim.open + tokenArray.map(function(val) { 
            return val.token;
        }).join(' ') + delim.close;
    
    //Perform calculation
    var calculation = calculateVal(expr);
    //Iterate through steps
    for(var i = 0; i < calculation.steps.length; i++) {
        //Add step description to div
        answerDiv.innerHTML += "<br />     Step " + (i + 1) + ": " + delim.open;
        answerDiv.innerHTML += calculation.steps[i].expr.map(function(val) { 
            if (calculation.steps[i].spaces.indexOf(val) > -1) {
                return delim.highlight + val.token + delim.highlightEnd;
            } else {
                return val.token; 
            }
        }.bind(calculation.steps[i])).join(' ');

        //Close step description
        answerDiv.innerHTML += delim.close;
    }
        
    //Add answer to div display
    answerDiv.innerHTML += "<br />     Answer: " + delim.open + calculation.value.map(function(val) { return val.token; } ).join(' ') + delim.close;

    //Add div to dom and clear input box
    calcHistory.appendChild(answerDiv);
    inputField.value = "";

    //Increment solution count for naming div
    solutionCount++;
};

//Calculate results and record steps
function calculateVal(queue) {
    //Processing stack to hold constants, variables, and skipped operators
    var stack = [];

    //Output object, with steps array
    var output = {steps: []};

    //Lowest numeric (highest value) precedence value of any operation in queue
    //0 is technically the highest precedence, so each parenLevel gets its own precedence band
    var minPrecedence = 0 - operations.maxPreced * queue.reduce(function(acc, val) { return Math.max(acc, val.parenLevel); }, 0); 

    //Loop once for each potential precedence level
    for (var i = minPrecedence; i <= operations.maxPreced; i++) {

        var result = {complete: false};
        queue = negativeOperators(queue);
        queue = removeExcessParens(queue);

        //Remove excess parens         


        //Flatten paren levels
/*
        for (var j = 0; j < queue.length; j++) {
            if (j == 0) {
                while (queue.length > 1 && queue[j + 1].parenLevel < queue[j].parenLevel) {
                    queue[j].parenLevel--;
                }
            } else if (j == queue.length - 1) {
                while (queue.length > 1 && queue[j - 1].parenLevel < queue[j].parenLevel) {
                    queue[j].parenLevel--;
                }
            } else {
                while (queue[j - 1].parenLevel < queue[j].parenLevel && queue[j + 1].parenLevel < queue[j].parenLevel) {
                    queue[j].parenLevel--;
                }
            }
        }
*/
        //Iterate over expression
        for (var j = 0; j < queue.length; j++) {

            var token = queue[j];

            //Only advance on operators of valid precedence level
            if (token.type == 'operator' && (operations[token.token].preced - operations.maxPreced * token.parenLevel == i)) {

                //Distributive operators
                if (operations[token.token].distrib) {
                    var a = [], //Queue for left side values
                        b = [], //Queue for right side values
                        caret = 0, //Index pointer for operand selection
                        pl = 0, //Current parenLevel
                        tokenPL = token.parenLevel, //parenLevel of token
                        expended = false,
                        tmpQueue;

                    //Grab left value if its a constant or variable
                    if (j > 0 && (queue[j - 1].type == 'constant' || queue[j - 1].type == 'variable')) {
                        if (j > 1 && queue[j - 2].token == '-') {
                            queue[j - 1] = operations['*'].pred(queue[j - 1], {type:'constant', value: '-1'}).result;
                            queue[j - 2].token = '+';                            
                        }

                        a.push(queue[j -1]);

                    //If the left value is a paren, start rolling up values
                    } else if (j > 0 && (queue[j - 1].type == 'parenthesis')) {
                        //Set pointer to 1 left of token
                        caret = j - 1;
                        pl = tokenPL;
                        //While we still have values and are above the token paren depth
                        while(caret >= 0) {
                            //Grab a value, if available
                            if (queue[caret].type == 'constant' || queue[caret].type == 'variable') {
                                if (caret > 0 && queue[caret - 1].type == 'operator' && queue[caret - 1].token == '-') {
                                    queue[caret] = operations['*'].pred(queue[caret], {type:'constant', value: '-1'}).result;
                                    queue[caret - 1].token = '+';
                                }
                                a.push(queue[caret]);
                            //Increase depth of parens
                            } else if (queue[caret].token == ')') {
                                pl++;
                            //Decrease paren depth
                            } else if (queue[caret].token == '(') {
                                pl--;
                            }
                            if (pl <= tokenPL) {
                                break;
                            }
                            caret--;
                        }
                        //We built R -> L, but convention operates L -> R
                        a = a.reverse();
                    }

                    //Grab the next available right hand value, or roll up
                    if (j < queue.length - 1 && (queue[j + 1].type == 'constant' || queue[j + 1].type == 'variable')) {
                        if (j > 1 && queue[j - 2].token == '-') {
                            queue[j - 1] = operations['*'].pred(queue[j - 1], {type:'constant', value: '-1'}).result;
                            queue[j - 2].token = '+';                            
                        }
                        b.push(queue[j + 1]);
                    //It's a paren, so we're starting the roll up
                    } else if (j < queue.length - 1 && (queue[j + 1].type == 'parenthesis')) {
                        //Set pointer to 1 right of operator
                        caret = j + 1;
                        pl = tokenPL;
                        //While we still have values and while we're deeper than the token
                        while(caret <= queue.length - 1) {
                            //Grab a value, if available
                            if (queue[caret].type == 'constant' || queue[caret].type == 'variable') {
                                if (caret > 0 && queue[caret - 1].type == 'operator' && queue[caret - 1].token == '-') {
                                    queue[caret] = operations['*'].pred(queue[caret], {type:'constant', value: '-1'}).result;
                                    queue[caret - 1].token = '+';
                                }                                
                                b.push(queue[caret]);
                            //Open paren, so increase depth
                            } else if (queue[caret].token == '(') {
                                pl++;
                            //Close paren, so decrease depth
                            } else if (queue[caret].token == ')') {
                                pl--;
                            }
                            if (pl <= tokenPL) {
                                break;
                            }
                            caret++;
                        }
                    }

                    tmpQueue = queue.slice();
                    if (a.length == 1 && b.length == 1) {
                        //Single values on each side
                        result = operations[token.token].pred(a[0], b[0]);
                        if (result.complete) {
                            output.steps.push({spaces: a.concat(b, token), expr: tmpQueue, result: result.result});
                            queue[queue.indexOf(b[0])] = result.result;
                            queue.splice(queue.indexOf(a[0]), 1);
                            queue.splice(queue.indexOf(token), 1);
                            j--;
                        }                    
                    } else if (a.length == 1 && b.length > 1) {
                        //Copy left values onto right values, maintaining operators
                        for (var k = 0; k < b.length; k++) {
                            queue.splice(queue.indexOf(b[k]), 1, Object.assign({}, a[0]), {type: 'operator', parenLevel: b[k].parenLevel, token: token.token}, b[k]);
                        }
                        output.steps.push({spaces: a.concat(b, token), expr: tmpQueue});
                        queue.splice(queue.indexOf(a[0]), 1);
                        queue.splice(queue.indexOf(token), 1);
                        j = queue.indexOf(b[0]) - 2;
			            i -= operations.maxPreced;
                    } else if (a.length > 1 && b.length == 1) {
                        //Copy right values onto left values, maintaining operators
                        for (var k = 0; k < a.length; k++) {
                            queue.splice(queue.indexOf(a[k]), 1, Object.assign({}, b[0]), {type: 'operator', parenLevel: a[k].parenLevel, token: token.token}, a[k]);
                        }
                        output.steps.push({spaces: a.concat(b, token), expr: tmpQueue});
                        queue.splice(queue.indexOf(b[0]), 1);
                        queue.splice(queue.indexOf(token), 1);
                        j = queue.indexOf(a[0]) - 3;
			            i -= operations.maxPreced;
                    } else if (a.length > 1 && b.length > 1) {
                        //Compound Distribution
                        var start = queue.indexOf(a[0]);
                        caret = start;
                        queue.splice
                        for (var k = 0; k < b.length; k++) {
                            for (var l = 0; l < a.length; l++) {
                                if (queue.indexOf(token) > -1) {
                                    queue.splice(caret, queue.indexOf(b[b.length - 1]) - caret + 1);
                                    caret++;
                                }
                                if (k != 0 || l != 0) {
                                    queue.splice(caret - 1, 0, {type: 'operator', token: '+', parenLevel: token.parenLevel});
                                    caret++;
                                }
                                queue.splice(caret - 1, 0, Object.assign({}, a[l]), {type: 'operator', parenLevel: a[l].parenLevel, token: token.token}, Object.assign({}, b[k]));
                                caret += 3;
                                expended = true;
			                    queue = negativeOperators(queue);
				                queue = removeExcessParens(queue);
                            }
                        }
                        if (expended) {
                            output.steps.push({spaces: a.concat(b, token), expr: tmpQueue, result: result.result});
                            j = start - 1;                       
                            i -= operations.maxPreced;
                        }
                    }
                    queue = negativeOperators(queue);
                    queue = removeExcessParens(queue);
                } else {
                    //Non distributive operator, so lets just collect like terms
                    if ( j != 0 && j < queue.length - 1 ) {
                        //Grab right operand
                        var a = queue[j + 1],
                            tmpQueue = queue.slice(),
                            aIndex = queue.indexOf(a);
                        //Iterate over items to the left
                        for (var k = j; k >= 0; k--) {
                            //Grab left operand
                            var b = queue[k];
                            if (b.type == 'parenthesis') {
                                break;
                            }

                            var bIndex = k;
                            if (aIndex > 0 && queue[aIndex - 1].type == 'operator' && queue[aIndex - 1].token == '-') {
                                queue[aIndex] = operations['*'].pred(queue[aIndex], {type:'constant', value: '-1'}).result;
                                queue[aIndex - 1] = {type: 'operator', token: '+', parenLevel: queue[bIndex - 1].parenLevel};                                
                            }
                            if (bIndex > 0 && queue[bIndex - 1].type == 'operator' && queue[bIndex - 1].token == '-') {
                                queue[bIndex] = operations['*'].pred(queue[bIndex], {type:'constant', value: '-1'}).result;
                                queue[bIndex - 1] = {type: 'operator', token: '+', parenLevel: queue[bIndex - 1].parenLevel};                               
                            }                            

                            //Attempt calculation
                            result = operations[token.token].pred(queue[bIndex], a);
                            if ( result.complete ) {
                                //On valid calculation, push output
                                output.steps.push({spaces: [a, queue[k], token], expr: negativeOperators(tmpQueue), result: result.result});
                                //Replace operator with result
                                queue[bIndex] = result.result;
                                //Splice out both values;
                                queue.splice(aIndex, 1);
                                queue.splice(aIndex - 1, 1);
                                //Roll pointer back so we test next potential operator
                                j = bIndex;
                                queue = negativeOperators(queue);
                                break;
                            }
                        }
                    }

                }
            }

        }
        queue = negativeOperators(queue);
    	queue = removeExcessParens(queue);
    }
    //Our queue is ready, so set and return
    queue = negativeOperators(queue);
    queue = removeExcessParens(queue);
    output.value = queue.slice();

    return output;
}

function isAlpha(character) {
    return character.search(/[0-9a-zA-Z]/) > -1;
}

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

function negativeOperators(queue) {
    //Clean negative numbers
    for (var j = 1; j < queue.length; j++) {
        if (queue[j].type == 'constant') {
            if (queue[j - 1].type == 'operator' && queue[j - 1].token == '+') {
                if (queue[j].value < 0) {
                    queue[j] = operations['*'].pred(queue[j], {type:'constant', value: '-1'}).result;
                    queue[j - 1] = {type: 'operator', token: '-', parenLevel: queue[j - 1].parenLevel};
                }
            } else if (queue[j - 1].type == 'operator' && queue[j - 1].token == '-') {
                if (queue[j].value < 0) {
                    queue[j] = operations['*'].pred(queue[j], {type:'constant', value: '-1'}).result;
                    queue[j - 1] = {type: 'operator', token: '+', parenLevel: queue[j - 1].parenLevel};
                }
            }
        } else if (queue[j].type == 'variable') {
            if (queue[j - 1].type == 'operator' && queue[j - 1].token == '+') {
                if (queue[j].coefficient < 0) {
                    queue[j] = operations['*'].pred(queue[j], {type:'constant', value: '-1'}).result;
                    queue[j - 1] = {type: 'operator', token: '-', parenLevel: queue[j - 1].parenLevel};
                }
            } else if (queue[j - 1].type == 'operator' && queue[j - 1].token == '-') {
                if (queue[j].coefficient < 0) {
                    queue[j] = operations['*'].pred(queue[j], {type:'constant', value: '-1'}).result;
                    queue[j - 1] = {type: 'operator', token: '+', parenLevel: queue[j - 1].parenLevel};
                }
            }
        }
    }
    return queue;
}

function removeExcessParens(queue) {
    for (var j = 0; j < queue.length; j++) {
        var start,
            end,
            pointer = j,
            level = 0;
        if (queue[j].token == '(' && j < queue.length - 1) {
            start = j;
            while (pointer < queue.length) {
                if (queue[pointer].token == '(') {
                    level++;
                } else if (queue[pointer].token == ')') {
                    if (level == 1) {
                        end = pointer;
                        break;
                    } else {
                        level--;
                    }
                }
                pointer++;
            }
            if (!end) {
                queue.error = 'Mismatched Parentheses';
                return queue;
            } else {
                if ((start == 0 || (queue[start - 1].type == 'operator' && !operations[queue[start - 1].token].distrib)) && 
                    (end == queue.length - 1 || (queue[end + 1].type == 'operator' && !operations[queue[end + 1].token].distrib))) {
                    queue.splice(start, 1);
                    queue.splice(end - 1, 1);
                    j--;
                } else if (end - start == 1) {
                    queue.splice(start, 2);
                    j--;
                }
            }
        }
    }
    return queue;
}

if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}
