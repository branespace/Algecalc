/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	var algebra = __webpack_require__(1)

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
	    var tokenizer = __webpack_require__(12);

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
	    var postfix = (__webpack_require__(13)(tokenArray.slice()));
	    console.log(postfix.map(function(val){return val.token;}).join(' '));
	    var binaryTree = (__webpack_require__(14)(postfix.slice()));
	    console.dir(binaryTree);
	    var tokenizedArray = (__webpack_require__(15)(binaryTree));
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var algebra = {};

	algebra.operations = __webpack_require__(2);

	module.exports = algebra;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var operations = {};

	operations['+'] = __webpack_require__(3);
	operations['-'] = __webpack_require__(7);
	operations['*'] = __webpack_require__(8);
	operations['/'] = __webpack_require__(9);
	operations['^'] = __webpack_require__(10);
	operations['%'] = __webpack_require__(11);

	module.exports = (function() {

	    //Get operator counts and maximum precidence value
	    var operArray = Object.keys(operations);
	    operations.count = operArray.length;
	    operations.maxPreced = operArray.reduce(function(acc, val) {
	        if(typeof operations[val] == 'function') {
	            return acc;
	        }
	        return Math.max(acc, operations[val].preced);
	        }, 0);
	    return operations;
	})();

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Constant on constant addition
	    if (a.type == 'constant' && b.type == 'constant') {
	        //Get the two values and add them
	        var answer = a.value + b.value;

	        //Create new token object for result
	        result.result = new Term('', a.parenLevel, 'constant', answer);
	        result.complete = true;
	    
	    }  else if (a.type == 'variable' && b.type == 'variable') {
	        for (var i = 0; i < a.symbol.length; i++) {
	            if (a.symbol[i] != b.symbol[i]) {
	                return result;
	            }
	            if (a.power[i] != b.power[i]) {
	                return result;
	            }
	            var answer = a.coefficient + b.coefficient;
	            if (answer == 0) {
	                result.result = new Term('', a.parenLevel, 'constant', 0);
	                result.complete = true;
	                return result;
	            }
	            result.result = new Term('', a.parenLevel, 'variable', answer, a.symbol, a.power);
	            result.complete = true;
	        }
	    }
	    //Return token object

	    return result;
	};

	module.exports = new Operation('+', 5, 'left', false, predicate);

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function Operation(token, precedence, associativity, distribution, predicate) {
	    this.token = token;
	    this.preced = precedence;
	    this.assoc = associativity;
	    this.distrib = distribution;
	    this.pred = predicate;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utility = __webpack_require__(6);

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

/***/ },
/* 6 */
/***/ function(module, exports) {

	var utility = {};

	utility.sortArraysTogether = function (a, b, predicate) {
	    var list = [];
	    for (var i in a) {
	        list.push({a: a[i], b: b[i]});
	    }

	    if (!predicate) {
	        list.sort(function(a, b) { return a.a == b.a ? 0 : +(a.a > b.a) || -1;} );
	    } else {
	        list.sort(predicate);
	    }

	    for (var i in list) {
	        a[i] = list[i].a;
	        b[i] = list[i].b;
	    }

	    return {a: a, b: b};
	}

	utility.BinaryNode = BinaryNode;
	function BinaryNode(node, left, right) {
	    this.node = node;
	    this.left = left ? left : null;
	    this.right = right ? right : null;
	}

	module.exports = utility;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};
	    //Constant on constant subtraction

	    if (a.type == 'constant' && b.type == 'constant') {
	        //Get the two value and subtract them
	        var answer = a.value - b.value;
	        //Create new token object for result
	        result.result = new Term('', a.parenLevel, 'constant', answer);
	        result.complete = true;

	    } else if (a.type == 'variable' && b.type == 'variable') {
	        for (var i = 0; i < a.symbol.length; i++) {
	            if (a.symbol[i] != b.symbol[i]) {
	                return result;
	            }
	            if (a.power[i] != b.power[i]) {
	                return result;
	            }
	            var answer = a.coefficient - b.coefficient;
	            if (answer == 0) {
	                result.result = new Term('', a.parenLevel, 'constant', 0);
	                result.complete = true;
	                return result;
	            }
	            result.result = new Term('', a.parenLevel, 'variable', answer, a.symbol, a.power);
	            result.complete = true;
	        }
	    }
	    //Return token object
	    return result;
	};

	module.exports = new Operation('-', 5, 'left', false, predicate);

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Constant on constant multiplication
	    if (a.type == 'constant' && b.type == 'constant') {
	        //Get the two value and multiply them
	        var answer = a.value * b.value;

	        //Create new token object for result
	        result.result = new Term('', a.parenLevel, 'constant', answer);
	        result.complete = true;
	    } else if ((a.type == 'constant' || b.type == 'constant') && (a.type == 'variable' || b.type =='variable') && (a.type != b.type)) {
	        if (a.type == 'variable') {
	            var variable = a;
	            var constant = b;
	        } else {
	            var variable = b;
	            var constant = a;
	        }
	        var answer = variable.coefficient * constant.value;
	        result.result = new Term('', a.parenLevel, 'variable', answer, variable.symbol, variable.power);
	        result.complete = true;
	    } else if (a.type == 'variable' && b.type == 'variable') {
	        var answer = a.coefficient * b.coefficient;
	        if (answer == 0) {
	            result.result = new Term('', a.parenLevel, 'constant', 0);
	            result.complete == true;
	        } else {
	            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });
	            var power = [];
	            for (var i = 0; i < symbol.length; i++) {
	                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) + (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
	            }
	            result.result = new Term('', a.parenLevel, 'variable', answer, symbol, power);
	            result.complete = true;
	        }
	    }

	    //Return token object
	    return result;
	};

	module.exports = new Operation('*', 4, 'left', true, predicate);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    if ((b.hasOwnProperty('value') && b.value == 0) || (b.hasOwnProperty('coefficient') && b.coefficient == 0)) {
	        result.error = 'division by 0 error';
	        return result;
	    }

	    //Constant on constant division
	    if (a.type == 'constant' && b.type == 'constant') {
	        //Get the two value and multiply them
	        var answer = a.value / b.value;

	        //Create new token object for result
	        result.result = new Term('', a.parenLevel, 'constant', answer);
	        result.complete = true;
	    } else if (a.type == 'constant' && b.type == 'variable') {
	        var answer = a.value / b.coefficient;
	        result.result = new Term('', a.parenLevel, 'variable', answer, b.symbol, b.power.map(function(val) { return val * -1; }));
	        result.complete = true;
	    } else if (a.type == 'variable' && b.type == 'constant') {
	        var answer = a.coefficient / b.value;
	        result.result = new Term('', a.parenLevel, 'variable', answer, a.symbol, a.power);
	        result.complete = true;        
	    } else if (a.type == 'variable' && b.type == 'variable') {
	        var answer = a.coefficient / b.coefficient;
	        if (answer == 0) {
	            result.result = new Term('', a.parenLevel, 'constant', 0);
	            result.complete == true;
	        } else {
	            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });
	            var power = [];
	            for (var i = 0; i < symbol.length; i++) {
	                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) - (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
	            }
	            result.result = new Term('', a.parenLevel, 'variable', answer, symbol, power);
	            result.complete = true;
	        }
	    }
	    return result;
	};

	module.exports = new Operation('/', 4, 'left', true, predicate);

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Constant on constant exponentiation
	    if (a.type == 'constant' && b.type == 'constant') {
	        //Get the two values and calculcate
	        var answer = Math.pow(a.value, b.value);

	        //Create new token object for result
	        result.result = new Term('', a.parenLevel, 'constant', answer);
	        result.complete = true;
	    }
	    //Return token object
	    return result;
	};

	module.exports = new Operation('^', 3, 'right', true, predicate);

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Constant on constant modulus
	    /*if (a.type == 'constant' && b.type == 'constant') {
	        //Get the two values and mod them
	        var answer = parseFloat(a.token, 10) % parseFloat(b.token, 10);

	        //Create new token object for result
	        result.result = {token: answer.toString(10), count: a.count, type: 'constant'};
	        result.complete = true;
	    } 
	    */
	    //Return token object
	    return result;
	};

	module.exports = new Operation('%', 4, 'left', true, predicate);

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var operations = __webpack_require__(2);

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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	//Based on the Shunting Yard Algorithm - Dijkstra
	var operations = __webpack_require__(2);

	module.exports = function tokenToPostfix(tokens) {
	    var stack = [];
	    var queue = [];
	    var token;

	    for (var i = 0; i < tokens.length; i++) {
	        token = tokens[i];
	        if (token.type == 'variable' || token.type == 'constant') {
	            queue.push(token);
	        } else if (token.type == 'function') {
	            //Prepared for future operations
	        } else if (token.type == 'operator') {
	            while ((stack.length && stack[stack.length - 1].type == 'operator') && 
	                   (( operations[token.token].assoc == 'left' && operations[token.token].preced >= operations[stack[stack.length - 1].token].preced ) || 
	                    ( operations[token.token].assoc == 'right' && operations[token.token].preced > operations[stack[stack.length - 1].token].preced ))) {
	                        queue.push(stack.pop());
	            }
	            stack.push(token);
	        } else if (token.token == '(') {
	            stack.push(token);
	        } else if (token.token == ')') {
	            while (stack.length && stack[stack.length - 1].token != '(') {
	                queue.push(stack.pop());
	            }
	            if (!stack.length) {
	                queue.error = 'mismatched parentheses';
	                return queue;
	            }
	            if (stack[stack.length - 1].token == '(') {
	                stack.pop();
	                if (stack.length && stack[stack.length - 1].type == 'function') {
	                    queue.push(stack.pop());
	                }
	            } 
	        }
	    }

	    while (stack.length) {
	        if (stack[stack.length - 1].type == 'parenthesis') {
	            queue.error = 'mismatched parentheses';
	            return queue;
	        }
	        queue.push(stack.pop());
	    }

	    return queue;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var utility = __webpack_require__(6);

	module.exports = function(queue) {
	    var stack = [];

	    for (var i = 0; i < queue.length; i++) {
	        var token = queue[i];
	        
	        if (token.type == 'constant' || token.type == 'variable') {
	            stack.push(new utility.BinaryNode(token));
	        } else if (token.type == 'operator') {
	            var right = stack.pop();
	            var left = stack.pop();
	            stack.push(new utility.BinaryNode(token, left, right));
	        }

	    }

	    return stack[0];
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Term = __webpack_require__(5);
	var operations = __webpack_require__(2);

	module.exports = function(tree) {
	    var tokens = [];
	    infixTraverse(tree, tokens);
	    return tokens;
	}

	function infixTraverse(tree, tokens) {
	    if (operations.hasOwnProperty(tree.node.token)) {
	        tokens.push(new Term('(', 0, 'parenthesis'));
	    }
	    if (tree.left) {
	        infixTraverse(tree.left, tokens);
	    }
	    tokens.push(tree.node);
	    if (tree.right) {
	        infixTraverse(tree.right, tokens);
	    }
	    if (operations.hasOwnProperty(tree.node.token)) {
	        tokens.push(new Term(')', 0, 'parenthesis'));
	    }    
	}

/***/ }
/******/ ]);