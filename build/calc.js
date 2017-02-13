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
	    var postfix = (__webpack_require__(14)(tokenArray.slice()));
	    var binaryTree = (__webpack_require__(15)(postfix.slice()));
	    var tokenizedArray = (__webpack_require__(16)(binaryTree));
	    var evaluated = (__webpack_require__(17)(binaryTree));

	    //Create and add expression and RPN string
	    answerDiv.innerHTML += "<br />Expression: " + delim.open + tokenArray.map(tidyExpr.bind([])).join(' ') + delim.close;
	    
	    //Perform calculation
	    //var calculation = calculateVal(expr);
	    //Iterate through steps
	    for(var i = 0; i < evaluated.steps.length; i++) {
	        //Add step description to div
	        var stepExpr = __webpack_require__(16)(evaluated.steps[i].tree);
	        answerDiv.innerHTML += "<br />     Step " + (i + 1) + ": " + delim.open;
	        answerDiv.innerHTML += stepExpr.map(tidyExpr.bind(evaluated.steps[i].nodes)).join(' ');

	        //Close step description
	        answerDiv.innerHTML += delim.close;
	    }
	        
	    //Add answer to div display
	    answerDiv.innerHTML += "<br />     Answer: " + delim.open + (__webpack_require__(16)(evaluated.tree)).map(tidyExpr.bind([])).join(' ') + delim.close;

	    //Add div to dom and clear input box
	    calcHistory.appendChild(answerDiv);
	    inputField.value = "";

	    //Increment solution count for naming div
	    solutionCount++;
	};

	function tidyExpr(val, index, arr) {
	    var tokenOut, negate;
	    //if (val.token == '-') {
	    //    val.token = '+';
	    //}
	    tokenOut = val.token;

	    if (val.type == 'operator' && val.token == '+')  {
	        if (arr.length > index + 1) {
	            if (arr[index + 1].type == 'constant') {
	                if (arr[index + 1].value < 0) {
	                    arr[index + 1].value = 0 - arr[index + 1].value;
	                    arr[index + 1].genToken(); 
	                    arr[index + 1].flip = true;
	                    tokenOut = '-';
	                }
	            } else if (arr[index + 1].type == 'variable') {
	                if (arr[index + 1].coefficient < 0) {
	                    arr[index + 1].coefficient = 0 - arr[index + 1].coefficient;
	                    arr[index + 1].genToken();
	                    arr[index + 1].flip = true;
	                    tokenOut = '-';
	                }
	            }
	        }
	    } else if (val.type == 'operator' && val.token == '-')  {
	        if (arr.length > index + 1) {
	            if (arr[index + 1].type == 'constant') {
	                if (arr[index + 1].value < 0) {
	                    arr[index + 1].value = 0 - arr[index + 1].value;
	                    arr[index + 1].genToken(); 
	                    arr[index + 1].flip = true;
	                    tokenOut = '+';
	                }
	            } else if (arr[index + 1].type == 'variable') {
	                if (arr[index + 1].coefficient < 0) {
	                    arr[index + 1].coefficient = 0 - arr[index + 1].coefficient;
	                    arr[index + 1].genToken();
	                    arr[index + 1].flip = true;
	                    tokenOut = '+';
	                }
	            }
	        }
	    }
	    if (val.hasOwnProperty('flip') && val.flip) {
	        if (val.type == 'constant') {
	            val.value = 0 - val.value;
	            val.genToken(); 
	            val.flip = false;
	        } else if (val.type == 'variable') {
	            val.coefficient = 0 - val.coefficient;
	            val.genToken();
	            val.flip = false;
	        }       
	    }
	    if (this.indexOf(val) > -1) {
	        tokenOut = delim.highlight + tokenOut + delim.highlightEnd;
	        this.splice(this.indexOf(val), 1);
	    } 
	    return tokenOut;
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
	    var settings = {algebra: {fix: 2}};
	    if (this.type == 'constant') {
		    if (Math.abs(this.value - Math.round(this.value)) < (Number.EPSILON || 2.2204460492503130808472633361816E-16)) {
	            this.token = (Math.round(this.value)).toString(10);
	        } else {
		        this.token = this.value.toFixed(settings.algebra.fix).toString(10);
	    }
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
	            if (Math.abs(this.coefficient - Math.round(this.coefficient)) < (Number.EPSILON || 2.2204460492503130808472633361816E-16)) {
	                this.token += (Math.round(this.coefficient)).toString(10);
	            } else {
	                this.token += this.coefficient.toFixed(settings.algebra.fix).toString(10);
	            }
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
	function BinaryNode(node, parent, left, right) {
	    this.node = node;
	    this.left = left ? left : null;
	    this.right = right ? right : null;
	    this.parent = parent ? parent : null;
	}

	utility.flattenTree = function flattenTree(tree, nodes, level) {
	    if (tree.left) {
	        flattenTree(tree.left, nodes, level + 1);
	    }
	    if (!nodes[level]) {
	        nodes[level] = [];
	    }
	    nodes[level].push(tree);
	    if (tree.right) {
	        flattenTree(tree.right, nodes, level + 1);
	    }
	}

	utility.treeDepth = function treeDepth(tree, depth) {
	    depth = depth || 0;
	    var left = tree.left ? utility.treeDepth(tree.left, depth + 1) : 0;
	    var right = tree.right ? utility.treeDepth(tree.right, depth + 1) : 0;
	    return Math.max(left, right, depth);
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
	var Term = __webpack_require__(5);
	var Terms = __webpack_require__(13);

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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var operations = __webpack_require__(2);
	var utility = __webpack_require__(6);
	var Term = __webpack_require__(5);

	var Terms = {};

	module.exports = Terms;

	Terms.fromToken = function(token, parenLevel) {
	    var term;

	    if (operations.hasOwnProperty(token)) {
	        term = new Term(token, parenLevel, 'operator');
	    } else if (token == '(' || token == ')') {
	        term = new Term(token, parenLevel, 'parenthesis');
	    } else {
	        var match = token.trim().match(/^(-?)(\d*),?(\d+)(\.)?(\d*)(e?)(\d*)?$/);
	        if (match) {
	            var tokenBuilder = '';
	            for (var i = 1; i < match.length; i++) {
	                tokenBuilder += match[i] ? match[i] : '';
	            }
	            var value = parseFloat(tokenBuilder, 10);
	            term = new Term(token, parenLevel, 'constant', value);
	        } else {
	            match = token.trim().match(/^(-?)(\d*),?(\d+)?(\.)?(\d*)(e?)(\d*)?([a-zA-Z])\^?(\d*)?/);
	            if (match) { 
	                var tokenBuilder = '';
	                var symbol = [];
	                var power = [];
	                for (var i = 1; i < 7; i++) {
	                    tokenBuilder += match[i] ? match[i] : '';
	                }
	                var coefficient;
	                if (tokenBuilder.length == 0) {
	                    coefficient = 1;
	                } else {
	                    coefficient = (tokenBuilder == '-' ? -1 : parseFloat(tokenBuilder, 10));
	                }
	                if (coefficient == 0 ) {
	                    term = new Term('0', parenLevel, 'constant', 0);
	                } else {
	                    symbol.push(match[8]);
	                    power.push(match[9] ? parseFloat(match[9], 10) : 1);
	                    var remaining = /([a-zA-Z])\^?(\d*)/g,
	                        match;
	                    while ((match = remaining.exec(token)) != null) {
	                        if (match[1] != symbol[0] && (match[2] ? match[2] != 0 : true)) {
	                            symbol.push(match[1]);
	                            power.push(match[2] ? parseFloat(match[2], 10) : 1);
	                        }
	                    }
	                    var sortedArrays = utility.sortArraysTogether(symbol, power);
	                    term = new Term(tokenBuilder, parenLevel, 'variable', coefficient, sortedArrays.a, sortedArrays.b);
	                }
	            }
	        }
	    }
	    
	    return term;   
	};

/***/ },
/* 14 */
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
/* 15 */
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
	            var parent = new utility.BinaryNode(token, null, left, right);
	            left.parent = parent;
	            right.parent = parent;
	            stack.push(parent);
	        }

	    }

	    return stack[0];
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var Term = __webpack_require__(5);
	var operations = __webpack_require__(2);

	module.exports = function(tree) {
	    var tokens = [];
	    infixTraverse(tree, tokens);

	    if (tokens.length == 1) {
	        return tokens;
	    }
	    return tokens.slice(1, -1);
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

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var operations = __webpack_require__(2);
	var utility = __webpack_require__(6);
	var Term = __webpack_require__(5);
	var BinaryNode = __webpack_require__(6).BinaryNode;
	var postfixToTree = __webpack_require__(15);
	var tokenToPostfix = __webpack_require__(14);

	module.exports = function(tree) {
	    var steps = [];
	    var nodes = [[]];
	    var result;
	    var treeCopy;
	    utility.flattenTree(tree, nodes, 0);
	    for (var i = nodes.length - 1; i >= 0; i--) {
	        for (var k = 0; k < nodes[i].length; k++) {
	            for (var j = 0; j <= operations.maxPreced; j++) {
	                var node = nodes[i][k];
	                if (node.node.type == 'operator' && operations[node.node.token].preced == j) {
	                    if (!operations[node.node.token].distrib) {
	                        treeCopy = copyBranch(tree);
	                        result = calculateNode(node, nodes);
	                        if (result) {
	                            tree = nodes[0][0];
	                            steps.push({tree: treeCopy, nodes: result});
	                            nodes = [];
	                            utility.flattenTree(tree, nodes, 0); 
	                            i = nodes.length - 1;
	                            k = 0;
	                            j = -1;                                  
	                        }      
	                    } else if (operations[node.node.token].distrib && operations[node.node.token].assoc == 'left') {
	                        var lhs = [],
	                            rhs = [];
	                        collectSubTreeTerms(node.left, lhs);
	                        collectSubTreeTerms(node.right, rhs);
	                        if (lhs.length == 1 && rhs.length == 1) {
	                            //Single node
	                            treeCopy = copyBranch(tree);   
	                            result = calculateNode(node, nodes);                                                     
	                            if (result) {
	                                tree = nodes[0][0];
	                                steps.push({tree: treeCopy, nodes: result});
	                                nodes = [];
	                                utility.flattenTree(tree, nodes, 0); 
	                                i = nodes.length - 1;
	                                k = 0;
	                                j = -1;                                  
	                            }                    
	                        } else {
	                            //Distribution
	                            var expr = [];
	                            for (var leftOperand = 0; leftOperand < lhs.length; leftOperand++) {
	                                for (var rightOperand = 0; rightOperand < rhs.length; rightOperand++) {
	                                    if (leftOperand != 0 || rightOperand != 0) {
	                                        expr.push(new Term('+', 0, 'operator'));
	                                    }
	                                    if (lhs[leftOperand].neg) {
	                                        lhs[leftOperand] = operations['*'].pred(lhs[leftOperand], new Term('-1', 0, 'constant', -1));
	                                        lhs[leftOperand].neg = false;
	                                    }
	                                    if (rhs[rightOperand].neg) {
	                                        rhs[rightOperand] = operations['*'].pred(rhs[rightOperand], new Term('-1', 0, 'constant', -1));
	                                        rhs[rightOperand].neg = false
	                                    }                                    
	                                    expr.push(lhs[leftOperand].node);
	                                    expr.push(new Term('*', 0, 'operator'));
	                                    expr.push(rhs[rightOperand].node);
	                                }
	                            }
	                            var postfixExpr = tokenToPostfix(expr);
	                            var subTree = postfixToTree(postfixExpr);
	                            if (node.parent) {
	                                subTree.parent = node.parent;
	                                if (node.parent.left == node) {
	                                    node.parent.left = subTree;
	                                } else {
	                                    node.parent.right = subTree;
	                                }
	                            } else {
	                                tree = subTree;
	                            }
	                            nodes = [];
	                            utility.flattenTree(tree, nodes, 0);
	                            i = nodes.length - 1;
	                            k = 0;
	                            j = -1;
	                        }
	                    }
	                }
	            }
	        }
	    }
	    return {tree: nodes[0][0], steps: steps};
	};

	function collectSubTreeTerms(tree, nodes, negate) {
	    negate = negate || false;
	    if (tree.left && !operations[tree.node.token].distrib) {
	        collectSubTreeTerms(tree.left, nodes, negate);
	    }
	    if (tree.node.type == 'constant' || tree.node.type == 'variable') {
	        if (negate) {
	            tree.neg = true;
	        }
	        nodes.push(tree);
	    }
	    if (tree.node.type == 'operator' && tree.node.token == '-') {
	        negate = !negate;
	    }
	    if (tree.right && !operations[tree.node.token].distrib) {
	        collectSubTreeTerms(tree.right, nodes, negate);
	    }
	}

	function calculateNode(node, nodes) {
	    var parentNode = node.parent;
	    var left = node.left;
	    var right = node.right;
	    var newTerm = operations[node.node.token].pred(left.node, right.node);

	    newTerm.node = right;
	    newTerm.fixedNode = left;
	    newTerm.side = 'left';
	    if (!newTerm.complete) { 
	        newTerm = searchTerms(node.node.token, right, left, 'left');
	    }
	    if (!newTerm.complete) {
	        newTerm = searchTerms(node.node.token, left, right, 'right');
	    }
	    if (newTerm.complete) {
	        var replace = replaceNodes(newTerm, node);
	        var replaced;
	        if (replace) {
	            nodes[0][0] = replace;
	            replaced = [];
	            replaced.push(node.node);
	            replaced.push(newTerm.node.node);
	            replaced.push(newTerm.fixedNode.node);
	        }
	        return replaced ? replaced : false;
	    }
	}

	function copyBranch(branch, newTree) {
	    if (!branch) {
	        return branch;
	    }
	    var newBranch = new BinaryNode(branch.node, newTree, null, null);
	    newBranch.left = copyBranch(branch.left, newBranch);
	    newBranch.right = copyBranch(branch.right, newBranch);
	    return newBranch;
	}

	function searchTerms(operator, node, fixedNode, side) {
	    var root;
	    var visited = [node, fixedNode];
	    var newTerm = {complete: false};
	    var negate = (side == 'left' ? (operator == '-' ? true : false) : false);
	    var parent = node.parent;
	    var start = node;
	    var searchSide = 'left', 
	        above = false;
	    while (!newTerm.complete) {
	        if (!node.parent) {
	            if (node == root) {
	                break;
	            }
	            root = node;
	        }
	        if (node.node.type == 'operator' && operations[node.node.token].distrib) {
	            break;
	        }
	        if (node.node.type == 'operator' && node.node.token == '-' && node != parent) {
	            negate = !negate;
	        }
	        if (node.left && visited.indexOf(node.left) == -1) {
	            node = node.left;
	            visited.push(node);
	        } else if (node.right && visited.indexOf(node.right) == -1) {
	            node = node.right;
	            visited.push(node)
	        } else if (node.parent) {
	            //Can't go down, so go up
	            node = node.parent;
	            if (node == start && !above) {
	                searchSide = 'right';
	                above = true;
	            } else if (node == start && above) {
	                if (start.parent.left == start) {
	                    searchSide = 'right';
	                } else {
	                    searchSide = 'left'
	                }
	            }
	            visited.push(node);
	        }
	        if (searchSide == 'right') {
	            console.log(fixedNode.node.token + ' ' + operator + ' ' + node.node.token)   
	            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
	                newTerm = operations[operator].pred(fixedNode.node, operations['*'].pred(node.node, new Term('-1', 0, 'constant', -1)).result);
	            } else {
	                newTerm = operations[operator].pred(fixedNode.node, node.node);
	            }
	        } else {
	            console.log(fixedNode.node.token + ' ' + operator + ' ' + node.node.token)            
	            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
	                newTerm = operations[operator].pred(node.node, operations['*'].pred(fixedNode.node, new Term('-1', 0, 'constant', -1)).result);
	            } else {
	                newTerm = operations[operator].pred(node.node, fixedNode.node);
	            }
	        }
	        newTerm.side = side;
	    }
	    newTerm.node = node;
	    newTerm.fixedNode = fixedNode;
	    newTerm.side = side;
	    return newTerm;
	}

	function replaceNodes(newTerm, parent) {
	    //CLONE TREE HERE
	    var newNode = new utility.BinaryNode(newTerm.result, parent, null, null);
	    var node = newTerm.node;
	    var fixedNode = newTerm.fixedNode;
	    var side = newTerm.side;
	    if (parent.parent) {
	        parent[side] = newNode;
	        if (node.parent && node.parent.parent) {
	            if (node.parent.parent.left == node.parent) {
	                if (node.parent.left == node) {
	                    node.parent.parent.left = node.parent.right;
	                    node.parent.right.parent = node.parent.parent;
	                    node.parent.left = null;
	                } else {
	                    node.parent.parent.left = node.parent.left;
	                    node.parent.left.parent = node.parent.parent;
	                    node.parent.right = null;
	                }
	            } else {
	                if (node.parent.left == node) {
	                    node.parent.parent.right = node.parent.right;
	                    node.parent.right.parent = node.parent.parent;
	                    node.parent.left = null;
	                } else {
	                    node.parent.parent.right = node.parent.left;
	                    node.parent.left.parent = node.parent.parent;
	                    node.parent.right = null;
	                }
	            }
	        } else {
	            if (node.parent.left == node) {
	                node.parent.right.parent = null;
	                return node.parent.right;                
	            } else {              
	                node.parent.left.parent = null;
	                return node.parent.left;                
	            }
	        }
	    } else {
	        return newNode;
	    }
	    var root = newNode;
	    while (root.parent) {
	        root = root.parent;
	    } 
	    return root;
	}

/***/ }
/******/ ]);