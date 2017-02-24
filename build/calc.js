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
	    submitButton.addEventListener('click', simplifyExpr);
	    inputField.addEventListener('keydown', function(event) {
	        if (event.key === 'Enter') {
	            simplifyExpr();
	        }
	    });
	    submitButton2 = document.getElementById('submitButton2');
	    calcHistory2 = document.getElementById('calculationhistory2');
	    inputField2 = document.getElementById('inputBox2');

	    //Enable handlers for calculation (button click, enter pressed)
	    submitButton2.addEventListener('click', solveEquation);
	    inputField2.addEventListener('keydown', function(event) {
	        if (event.key === 'Enter') {
	            solveEquation();
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
	var simplifyExpr = function() {

	    __webpack_require__(12)(inputField.value, calcHistory, solutionCount);

	    inputField.value = '';

	    //Increment solution count for naming div
	    solutionCount++;
	};

	var solveEquation = function() {
	    var inputs = inputField2.value.split('=');

	    __webpack_require__(19)(inputs[0], inputs[1], calcHistory2, solutionCount);

	    inputField2.value = '';

	    //Increment solution count for naming div
	    solutionCount++;  
	};

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
	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
	        result.complete = true;
	    
	    //Variable on variable addition
	    }  else if (a.type == 'variable' && b.type == 'variable') {
	        
	        //For each symbol
	        for (var i = 0; i < a.symbol.length; i++) {
	            //Check for symbol match. Symbols WILL be sorted
	            if (a.symbol[i] != b.symbol[i]) {
	                return result;
	            }
	            //Check for power match
	            if (a.power[i] != b.power[i]) {
	                return result;
	            }
	            
	            //The only change is the added coefficients
	            var answer = a.coefficient + b.coefficient;

	            //Coefficients equal 0
	            if (answer == 0) {
	                //Convert variable to constant and return
	                result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
	                result.complete = true;
	                return result;
	            }

	            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, a.symbol, a.power);
	            result.complete = true;
	        }
	    }
	    return result;
	};

	module.exports = new Operation('+', 5, 'left', false, predicate, '-', true);

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function Operation(token, precedence, associativity, distribution, predicate, inverse, negateInverse) {
	    this.token = token;
	    this.preced = precedence;
	    this.assoc = associativity;
	    this.distrib = distribution;
	    this.pred = predicate;
	    this.inverse = inverse;
	    this.negInverse = negateInverse;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utility = __webpack_require__(6);

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

/***/ },
/* 6 */
/***/ function(module, exports) {

	var utility = {};

	//Sorts an array, keeping a second array associations
	utility.sortArraysTogether = function (a, b, predicate) {
	    var list = [];

	    //Add array items to object pairs and push to array
	    for (var i in a) {
	        list.push({a: a[i], b: b[i]});
	    }

	    //Sort by predicate, or alpha sort if no predicate
	    if (!predicate) {
	        list.sort(function(a, b) { return a.a == b.a ? 0 : +(a.a > b.a) || -1;} );
	    } else {
	        list.sort(predicate);
	    }

	    //Move items back into seperate arrays
	    for (var i in list) {
	        a[i] = list[i].a;
	        b[i] = list[i].b;
	    }

	    return {a: a, b: b};
	}

	//BinaryNode constructor function
	utility.BinaryNode = BinaryNode;
	function BinaryNode(node, parent, left, right) {
	    this.node = node;
	    this.left = left ? left : null;
	    this.right = right ? right : null;
	    this.parent = parent ? parent : null;
	}

	//Converts a binary tree into a two dimensional array by depth of tree
	utility.flattenTree = function flattenTree(tree, nodes, level, depth) {
	    if (tree.left) {
	        flattenTree(tree.left, nodes, level + 1, depth);
	    }
	    if (!nodes[level + tree.node.parenLevel * depth]) {
	        nodes[level + tree.node.parenLevel * depth] = [];
	    }
	    nodes[level + tree.node.parenLevel * depth].push(tree);
	    if (tree.right) {
	        flattenTree(tree.right, nodes, level + 1, depth);
	    }
	}

	//Gets the depth of the tree
	utility.treeDepth = function treeDepth(tree, depth) {
	    depth = depth || 0;

	    //Get left side depth
	    var left = tree.left ? utility.treeDepth(tree.left, depth + 1) : 0;

	    //Get right side depth
	    var right = tree.right ? utility.treeDepth(tree.right, depth + 1) : 0;

	    //Return deepest side depth
	    return Math.max(left, right, depth);
	}

	//Collect terms down one branch of tree
	utility.collectSubTreeTerms = function collectSubTreeTerms(tree, nodes, negate, operations) {
	    negate = negate || false;
	    if (tree.left && !operations[tree.node.token].distrib) {
	        utility.collectSubTreeTerms(tree.left, nodes, negate, operations);
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
	        utility.collectSubTreeTerms(tree.right, nodes, negate, operations);
	    }
	};

	//Copies a subtree recursively, replacing nodes but maintaining values
	utility.copyBranch = function copyBranch(branch, newTree) {
	    if (!branch) {
	        return branch;
	    }
	    var newBranch = new BinaryNode(branch.node, newTree, null, null);
	    newBranch.left = utility.copyBranch(branch.left, newBranch);
	    newBranch.right = utility.copyBranch(branch.right, newBranch);
	    return newBranch;
	};

	utility.tidyExpr = function tidyExpr(val, index, arr) {
	    var tokenOut, negate;
	//Delimiter support for expressions (s.a. colorization and MathJax support)
	var delim = {
	        open: '',  //Start of expression
	        close: '', //End of expression
	        highlight: '<span style="color: #ff0000">', //Start of highlighted section
	        highlightEnd: '</span>'                     //End of highlighted section
	    };
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
	        var answer = a.value - b.value;

	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
	        result.complete = true;

	    //Variable on variable subtraction
	    } else if (a.type == 'variable' && b.type == 'variable') {
	        for (var i = 0; i < a.symbol.length; i++) {
	            //Check for symbol matches, and fail if not
	            if (a.symbol[i] != b.symbol[i]) {
	                return result;
	            }

	            //Check for power matches, and fail if not
	            if (a.power[i] != b.power[i]) {
	                return result;
	            }
	            var answer = a.coefficient - b.coefficient;

	            //0 coefficient, so return a constant
	            if (answer == 0) {
	                result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
	                result.complete = true;
	                return result;
	            }
	            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, a.symbol, a.power);
	            result.complete = true;
	        }
	    }
	    return result;
	};

	module.exports = new Operation('-', 5, 'left', false, predicate, '+');

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Constant on constant multiplication
	    if (a.type == 'constant' && b.type == 'constant') {
	        var answer = a.value * b.value;

	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
	        result.complete = true;

	    //Constant on variable multiplication
	    } else if ((a.type == 'constant' || b.type == 'constant') && (a.type == 'variable' || b.type =='variable') && (a.type != b.type)) {
	        if (a.type == 'variable') {
	            var variable = a;
	            var constant = b;
	        } else {
	            var variable = b;
	            var constant = a;
	        }

	        var answer = variable.coefficient * constant.value;
	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, variable.symbol, variable.power);
	        result.complete = true;

	    //Variable on variable multiplication
	    } else if (a.type == 'variable' && b.type == 'variable') {
	        var answer = a.coefficient * b.coefficient;

	        //0 coefficient
	        if (answer == 0) {
	            //Return a constant
	            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
	            result.complete == true;

	        //Non-zero coefficient
	        } else {
	            //Combine symbols, removing duplicates
	            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });

	            //For each symbol in a or b, return 0 or the power if found, and then add
	            var power = [];
	            for (var i = 0; i < symbol.length; i++) {
	                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) + (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
	            }

	            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, symbol, power);
	            result.complete = true;
	        }
	    }
	    return result;
	};

	module.exports = new Operation('*', 4, 'left', 'both', predicate, '/');

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Check for a zero term and abort
	    if ((b.hasOwnProperty('value') && b.value == 0) || (b.hasOwnProperty('coefficient') && b.coefficient == 0)) {
	        result.error = 'division by 0 error';
	        return result;
	    }

	    //Constant on constant division
	    if (a.type == 'constant' && b.type == 'constant') {
	        var answer = a.value / b.value;

	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', answer);
	        result.complete = true;

	    //Constant divided by variable
	    } else if (a.type == 'constant' && b.type == 'variable') {
	        var answer = a.value / b.coefficient;

	        //Also ensure that the powers are now negative
	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, b.symbol, b.power.map(function(val) { return val * -1; }));
	        result.complete = true;

	    //Variable divided by constant
	    } else if (a.type == 'variable' && b.type == 'constant') {
	        var answer = a.coefficient / b.value;

	        //Same case as above, but since variable is on top, powers are unchanged
	        result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, a.symbol, a.power);
	        result.complete = true;        

	    //Variable on variable division
	    } else if (a.type == 'variable' && b.type == 'variable') {
	        var answer = a.coefficient / b.coefficient;

	        //0 coefficient
	        if (answer == 0) {
	            //Return will be a constant
	            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'constant', 0);
	            result.complete == true;

	        //Non-zero coefficient
	        } else {
	            //Concatenate symbols, with duplicate removal
	            var symbol = a.symbol.concat(b.symbol).sort().filter(function(val, index, self) { return !index || self[index - 1] != val });

	            //Powers are subtracted
	            var power = [];
	            for (var i = 0; i < symbol.length; i++) {
	                //          If the symbol is in a              get symbol                                   if the symbol is in be             get symbol
	                power.push((a.symbol.indexOf(symbol[i]) > -1 ? a.power[a.symbol.indexOf(symbol[i])] : 0) - (b.symbol.indexOf(symbol[i]) > -1 ? b.power[b.symbol.indexOf(symbol[i])] : 0));
	            }

	            result.result = new Term('', Math.min(a.parenLevel, b.parenLevel), 'variable', answer, symbol, power);
	            result.complete = true;
	        }
	    }
	    return result;
	};

	module.exports = new Operation('/', 4, 'left', 'left', predicate, '*', false);

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Operation = __webpack_require__(4);
	var Term = __webpack_require__(5);

	var predicate = function(a, b) {
	    var result = {complete: false};

	    //Constant on constant exponentiation
	    if (a.type == 'constant' && b.type == 'constant') {
	        var answer = Math.pow(a.value, b.value);

	        result.result = new Term('', a.parenLevel, 'constant', answer);
	        result.complete = true;
	    }
	    return result;
	};

	module.exports = new Operation('^', 3, 'right', 'left', predicate);

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

	module.exports = new Operation('%', 4, 'left', 'left', predicate);

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	//Algebra calcuation module
	var algebra = __webpack_require__(1)

	//List of enabled operations
	var operations = algebra.operations;

	//Utility library
	var utility = __webpack_require__(6);

	//Delimiter support for expressions (s.a. colorization and MathJax support)
	var delim = {
	        open: '',  //Start of expression
	        close: '', //End of expression
	        highlight: '<span style="color: #ff0000">', //Start of highlighted section
	        highlightEnd: '</span>'                     //End of highlighted section
	    };

	//Main calculation loop
	module.exports = function(input, calcHistory, solutionCount) {
	    var tokenizer = __webpack_require__(13);

	    //Tokenize input
	    var tokenArray = tokenizer(input);

	    //Error flag
	    var error = false;

	    //Create new output div element
	    var answerDiv = document.createElement('div');
	    answerDiv.id = 'solution ' + solutionCount;

	    var postfix = (__webpack_require__(15)(tokenArray.slice()));
	    var binaryTree = (__webpack_require__(16)(postfix.slice()));
	    var tokenizedArray = (__webpack_require__(17)(binaryTree));
	    var evaluated = (__webpack_require__(18)(binaryTree));

	    //Create and add expression and RPN string
	    answerDiv.innerHTML += "<br />Expression: " + delim.open + tokenArray.map(utility.tidyExpr.bind([])).join(' ') + delim.close;
	    
	    //Iterate through steps
	    for(var i = 0; i < evaluated.steps.length; i++) {
	        //Add step description to div
	        var stepExpr = __webpack_require__(17)(evaluated.steps[i].tree);
	        answerDiv.innerHTML += "<br />     Step " + (i + 1) + ": " + delim.open;
	        answerDiv.innerHTML += stepExpr.map(utility.tidyExpr.bind(evaluated.steps[i].nodes)).join(' ');

	        //Close step description
	        answerDiv.innerHTML += delim.close;
	    }
	        
	    //Add answer to div display
	    answerDiv.innerHTML += "<br />     Answer: " + delim.open + (__webpack_require__(17)(evaluated.tree)).map(utility.tidyExpr.bind([])).join(' ') + delim.close;

	    //Add div to dom and clear input box
	    calcHistory.appendChild(answerDiv);
	};    

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var operations = __webpack_require__(2);
	var Term = __webpack_require__(5);
	var Terms = __webpack_require__(14);

	//Takes in text and turns it into tokens for RPN processing
	module.exports = function(text) {
	    //Temporary string for building multi-digit numbers
	    var builder = '';
	    //Token output array
	    var tokens = [],
	        parenLevel = 0;

	    for (var i = 0; i < text.length; i++) {
	        var token = text[i];

	        //Check for a negative number.  Negative signs appear at the beginning of an expression or after an operator
	        if (token == '-' && !builder.length && ( i == 0 || (tokens.length && (isOperator(tokens[tokens.length - 1].token) || (tokens[tokens.length - 1].type == 'parenthesis'))))) {
	            //Are we following a paren group? Add addition operator
	            if (tokens.length && tokens[tokens.length - 1].token == ')') {
	                tokens.push(new Term('+', parenLevel, 'operator'));                    
	            }

	            //Are we preceding a paren group?
	            if (i < text.length - 1 && text[i + 1] == '(') {
	                //Add distribution of negative sign
	                tokens.push(new Term('-1', parenLevel, 'constant', -1));
	                tokens.push(new Term('*', parenLevel, 'operator'));                
	            } else {
	                //Otherwise, we actually get a negative number!
	                builder += token;
	            }

	        //Check for a variable to a power
	        } else if (token == '^' && builder.length && (builder.charCodeAt(builder.length - 1) >= 'a'.charCodeAt()) && (builder.charCodeAt(builder.length - 1) <= 'z'.charCodeAt())) {
	            builder += token;

	        //If we have an infix operator...
	        } else if (isOperator(token)) {
	            //Add existing number from builder to tokens, checking type of token
	            if (builder.length) {
	                tokens.push(Terms.fromToken(builder, parenLevel));
	            }
	            
	            builder = '';

	            //Add our token to the token array and mark as operator
	            if (token == '-' && i < text.length - 1 && text[ i + 1 ] == '(') {
	                //Preceding a paren group
	                if (tokens.length) {
	                    //Not the first item, so add
	                    tokens.push(new Term('+', parenLevel, 'operator'));
	                }
	                //Distribute negative sign
	                tokens.push(new Term('-1', parenLevel, 'constant', -1));
	                tokens.push(new Term('*', parenLevel, 'operator'));
	            } else {
	                //Actually an operator, so lets add it
	                tokens.push(new Term(token, parenLevel, 'operator'));
	            }

	        //If we have a number or letter...
	        } else if (isAlpha(token) || token == '.') {
	            //Add to our token builder.  We validate LATER
	            builder += token;

	        //On parentheses, add to token list
	        } else if (token == '(') {
	            //If we have anything in our buffer, add it with multiplication
	            if (builder.length) {
	                tokens.push(Terms.fromToken(builder, parenLevel));
	                builder = '';
	                tokens.push(new Term('*', parenLevel, 'operator'));
	            } else if (tokens.length && tokens[tokens.length - 1].token == ')') {
	                //Following a paren group, so expect multiplication
	                tokens.push(new Term('*', parenLevel, 'operator'));
	            }

	            //Increment parenlevel
	            parenLevel++;
	            tokens.push(new Term('(', parenLevel, 'parenthesis'));

	        //On close parentheses, check for builder content first
	        } else if (token == ')') {
	            //If we have stuff in the builder, flush it to the token list and then add the parenthesis
	            if (builder.length) {
	                tokens.push(Terms.fromToken(builder, parenLevel));
	                builder = '';
	            }
	            tokens.push(new Term(')', parenLevel, 'parenthesis'));

	            //Now decrement parenlevel
	            parenLevel--;
	            if (i < text.length - 1 && isAlpha(text[i + 1])) {
	                tokens.push(new Term('*', parenLevel, 'operator'));
	            }
	        }
	    }

	    //Finished with tokens, so if we have anything left in the builder, flush to tokens
	    if (builder.length) {
	        tokens.push(Terms.fromToken(builder, parenLevel));
	    }

	    //Convert subtraction to adding negative numbers
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var operations = __webpack_require__(2);
	var utility = __webpack_require__(6);
	var Term = __webpack_require__(5);

	var Terms = {};

	module.exports = Terms;

	//Generate a new term from token
	Terms.fromToken = function(token, parenLevel) {
	    var term;

	    //Check for operator in operations list
	    if (operations.hasOwnProperty(token)) {
	        term = new Term(token, parenLevel, 'operator');

	    //Check for parentheses
	    } else if (token == '(' || token == ')') {
	        term = new Term(token, parenLevel, 'parenthesis');

	    //Not operator or paren, so SHOULD be term
	    } else {
	        //Try to match it to simple number
	        var match = token.trim().match(/^(-?)(\d*),?(\d+)(\.)?(\d*)(e?)(\d*)?$/);
	        if (match) {
	            var tokenBuilder = '';
	            for (var i = 1; i < match.length; i++) {
	                tokenBuilder += match[i] ? match[i] : '';
	            }
	            var value = parseFloat(tokenBuilder, 10);
	            term = new Term(token, parenLevel, 'constant', value);
	        } else {
	            //Didn't match, so maybe a variable?
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
	                    //No explicit coefficient, so add one
	                    coefficient = 1;
	                } else {
	                    //Correct negative sign if negative, or get the coefficient if not just a negative sign
	                    coefficient = (tokenBuilder == '-' ? -1 : parseFloat(tokenBuilder, 10));
	                }
	                if (coefficient == 0 ) {
	                    //Coefficient is 0, so we have a constant, really
	                    term = new Term('0', parenLevel, 'constant', 0);
	                } else {
	                    symbol.push(match[8]);
	                    power.push(match[9] ? parseFloat(match[9], 10) : 1);
	                    var remaining = /([a-zA-Z])\^?(\d*)/g,
	                        match;
	                    //Iterate over matches, adding symbols and optional powers to term
	                    while ((match = remaining.exec(token)) != null) {
	                        if (match[1] != symbol[0] && (match[2] ? match[2] != 0 : true)) {
	                            symbol.push(match[1]);
	                            power.push(match[2] ? parseFloat(match[2], 10) : 1);
	                        }
	                    }

	                    //Sort our symbols, keeping powers associated
	                    var sortedArrays = utility.sortArraysTogether(symbol, power);
	                    term = new Term(tokenBuilder, parenLevel, 'variable', coefficient, sortedArrays.a, sortedArrays.b);
	                }
	            }
	        }
	    }
	    
	    return term;   
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	//Based on the Shunting Yard Algorithm - Dijkstra
	var operations = __webpack_require__(2);

	//Converts a token array to postfixed notation
	module.exports = function tokenToPostfix(tokens) {
	    var stack = [];
	    var queue = [];
	    var token;

	    for (var i = 0; i < tokens.length; i++) {
	        token = tokens[i];

	        //Add variables and constants directly to the queue
	        if (token.type == 'variable' || token.type == 'constant') {
	            queue.push(token);
	        } else if (token.type == 'function') {
	            //Prepared for future operations
	        } else if (token.type == 'operator') {
	            //Move from the stack to the queue while we still have items of higher precedence
	            while ((stack.length && stack[stack.length - 1].type == 'operator') && 
	                   (( operations[token.token].assoc == 'left' && operations[token.token].preced >= operations[stack[stack.length - 1].token].preced ) || 
	                    ( operations[token.token].assoc == 'right' && operations[token.token].preced > operations[stack[stack.length - 1].token].preced ))) {
	                        queue.push(stack.pop());
	            }
	            stack.push(token);
	        //Parentheses go directly on stack
	        } else if (token.token == '(') {
	            stack.push(token);
	        } else if (token.token == ')') {
	            //Roll back to pick up all items within parens
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

	    //Clean up all items in stack
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var utility = __webpack_require__(6);

	//Converts postfix tokens to a binary tree
	module.exports = function(queue) {
	    var stack = [];

	    for (var i = 0; i < queue.length; i++) {
	        var token = queue[i];
	        
	        //Push variables and constants onto the stack
	        if (token.type == 'constant' || token.type == 'variable') {
	            stack.push(new utility.BinaryNode(token));
	        } else if (token.type == 'operator') {
	            //On operators, get both the left and right operand
	            var right = stack.pop();
	            var left = stack.pop();

	            //Build a new node with operands as children
	            var parent = new utility.BinaryNode(token, null, left, right);

	            //Link children to parent node
	            left.parent = parent;
	            right.parent = parent;

	            //Put the new node on the stack
	            stack.push(parent);
	        }
	    }

	    return stack[0];
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Term = __webpack_require__(5);
	var operations = __webpack_require__(2);

	//Converts binary tree to array of tokens
	module.exports = function(tree) {
	    var tokens = [];
	    infixTraverse(tree, tokens);

	    //Only got one token? return it
	    if (tokens.length == 1) {
	        return tokens;
	    }

	    //Remover leading and trailing parens
	    return tokens.slice(1, -1);
	}

	//Recursive in order traversal
	function infixTraverse(tree, tokens) {
	    //Operator, so begin a new set of parens
	    if (operations.hasOwnProperty(tree.node.token)) {
	        tokens.push(new Term('(', 0, 'parenthesis'));
	    }

	    //Traverse left side
	    if (tree.left) {
	        infixTraverse(tree.left, tokens);
	    }

	    //Add node
	    tokens.push(tree.node);

	    //Traverse right side
	    if (tree.right) {
	        infixTraverse(tree.right, tokens);
	    }

	    //We've processed all children, so close our parentheses
	    if (operations.hasOwnProperty(tree.node.token)) {
	        tokens.push(new Term(')', 0, 'parenthesis'));
	    }    
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var operations = __webpack_require__(2);
	var utility = __webpack_require__(6);
	var Term = __webpack_require__(5);
	var BinaryNode = __webpack_require__(6).BinaryNode;
	var postfixToTree = __webpack_require__(16);
	var tokenToPostfix = __webpack_require__(15);

	module.exports = function(tree) {
	    var steps = [];
	    var nodes = [[]];
	    var result;
	    var treeCopy;

	    //Converts the tree to 2-d array of nodes
	    utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree));
	    for (var i = nodes.length - 1; i >= 0; i--) {
	        //No nodes at this level, so skip
	        if (!nodes[i]) { continue; }
	        for (var k = 0; k < nodes[i].length; k++) {
	            for (var j = 0; j <= operations.maxPreced; j++) {
	                var node = nodes[i][k];  
	                //Operator and correct precedence            
	                if (node.node.type == 'operator' && operations[node.node.token].preced == j) {
	                    //Non-distributive operation
	                    if (!operations[node.node.token].distrib) {
	                        //Recursively copy tree
	                        treeCopy = utility.copyBranch(tree);
	                        //Attempt to calculate value
	                        result = calculateNode(node, nodes);

	                        if (result) {
	                            //Successfuly calculated, so reroot tree
	                            tree = nodes[0][0];
	                            steps.push({tree: treeCopy, nodes: result});
	                            nodes = [];
	                            utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree)); 

	                            //Janky restart processing
	                            i = nodes.length - 1;
	                            k = 0;
	                            j = -1;                                  
	                        }      
	                    } else if (operations[node.node.token].distrib && operations[node.node.token].assoc == 'left') {
	                        var lhs = [],
	                            rhs = [];

	                        //Collects all potential terms for distribution on both sides
	                        utility.collectSubTreeTerms(node.left, lhs, false, operations);
	                        utility.collectSubTreeTerms(node.right, rhs, false, operations);
	                        if (lhs.length == 1 && rhs.length == 1) {
	                            //Single node, so copy the tree and attempt calculation
	                            treeCopy = utility.copyBranch(tree);   
	                            result = calculateNode(node, nodes);                   

	                            if (result) {
	                                //Reroot tree
	                                tree = nodes[0][0];

	                                steps.push({tree: treeCopy, nodes: result});
	                                nodes = [];
	                                utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree)); 

	                                //Janky restart processing
	                                i = nodes.length - 1;
	                                k = 0;
	                                j = -1;                                  
	                            }                    
	                        } else if (operations[node.node.token].distrib == 'both') {
	                            //Distribution (LHS and or RHS non zero) and bimodal
	                            var expr = [];
	                            for (var leftOperand = 0; leftOperand < lhs.length; leftOperand++) {
	                                for (var rightOperand = 0; rightOperand < rhs.length; rightOperand++) {
	                                    //If not the first value, addition
	                                    if (leftOperand != 0 || rightOperand != 0) {
	                                        expr.push(new Term('+', node.node.parenLevel, 'operator'));
	                                    }

	                                    //If we're behind a negation operator, negate values
	                                    if (lhs[leftOperand].neg) {
	                                        lhs[leftOperand] = operations['*'].pred(lhs[leftOperand], new Term('-1', les[leftOperand].node.parenLevel, 'constant', -1));
	                                        lhs[leftOperand].neg = false;
	                                    }
	                                    if (rhs[rightOperand].neg) {
	                                        rhs[rightOperand] = operations['*'].pred(rhs[rightOperand], new Term('-1', rhs[rightOperand].node.parenLevel, 'constant', -1));
	                                        rhs[rightOperand].neg = false
	                                    }                                    
	                                    
	                                    //Add multiplication terms and set parenLevel to that of the operator
	                                    expr.push(lhs[leftOperand].node);
	                                    expr.push(new Term('*', node.node.parenLevel, 'operator'));
	                                    expr.push(rhs[rightOperand].node);
	                                    lhs[leftOperand].node.parenLevel = node.node.parenLevel;
	                                    rhs[rightOperand].node.parenLevel = node.node.parenLevel;
	                                }
	                            }
	                            
	                            //Convert to postfix and then to a new subtree
	                            var postfixExpr = tokenToPostfix(expr);
	                            var subTree = postfixToTree(postfixExpr);

	                            //Add subtree to parent of operator, or store as new root
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
	                            utility.flattenTree(tree, nodes, 0, utility.treeDepth(tree));

	                            //Janky restart processing
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

	//Calculate values of an operator node
	function calculateNode(node, nodes) {
	    var parentNode = node.parent;
	    var left = node.left;
	    var right = node.right;
	    var newTerm = operations[node.node.token].pred(left.node, right.node);

	    //Set fixed and selection node
	    newTerm.node = right;
	    newTerm.fixedNode = left;
	    newTerm.side = 'left';

	    //Switch nodes
	    if (!newTerm.complete) { 
	        newTerm = searchTerms(node.node.token, right, left, 'left');
	    }
	    //Switch sides
	    if (!newTerm.complete) {
	        newTerm = searchTerms(node.node.token, left, right, 'right');
	    }

	    //Did we find a match?
	    if (newTerm.complete) {
	        var replace = replaceNodes(newTerm, node);
	        var replaced;
	        if (replace) {
	            //Successfully replaced nodes
	            if (nodes[0]) {
	                nodes[0][0] = replace;
	            } else {
	                nodes[0] = [replace];
	            }
	            //Store replaced values
	            replaced = [];
	            replaced.push(node.node);
	            replaced.push(newTerm.node.node);
	            replaced.push(newTerm.fixedNode.node);
	        }
	        return replaced ? replaced : false;
	    }
	}

	//Find functional operator terms
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
	        //Loop until we have a term or break

	        if (!node.parent) {
	            //Hit the root
	            if (node == root) {
	                //We've been here before, so we should stop
	                break;
	            }
	            //Mark our root as visited
	            root = node;
	        }

	        //Break on distributive operator: we can't go past those
	        if (node.node.type == 'operator' && operations[node.node.token].distrib) {
	            break;
	        }

	        //Invert our negation flag.  Node != parent flag makes sure we don't double count
	        if (node.node.type == 'operator' && node.node.token == '-' && node != parent) {
	            negate = !negate;
	        }

	        //We have a left node that we haven't visited
	        if (node.left && visited.indexOf(node.left) == -1) {
	            //Move to the node and mark as seen
	            node = node.left;
	            visited.push(node);

	        //Maybe we have a right node that we haven't visited
	        } else if (node.right && visited.indexOf(node.right) == -1) {
	            //Move to the node and mark as seen
	            node = node.right;
	            visited.push(node)

	        //We have no children unvisited, so we go up the tree
	        } else if (node.parent) {
	            
	            node = node.parent;
	            if (node == start && !above) {
	                //Returned to start from below, so mark as complete and check the other side
	                searchSide = 'right';
	                above = true;
	            } else if (node == start && above) {
	                //Returned to initial node the second time, so switch sides
	                if (start.parent.left == start) {
	                    searchSide = 'right';
	                } else {
	                    searchSide = 'left'
	                }
	            }
	            visited.push(node);
	        }
	        //Process operator on viable operand, negating as necessary, and watching how / is not commutative
	        if (searchSide == 'right') {
	            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
	                newTerm = operations[operator].pred(fixedNode.node, operations['*'].pred(node.node, new Term('-1', node.node.parenLevel, 'constant', -1)).result);
	            } else {
	                newTerm = operations[operator].pred(fixedNode.node, node.node);
	            }
	        } else {       
	            if (negate && (node.node.type == 'constant' || node.node.type == 'variable')) {
	                newTerm = operations[operator].pred(node.node, operations['*'].pred(fixedNode.node, new Term('-1', node.node.parenLevel, 'constant', -1)).result);
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

	//Swap tree nodes to remove replaced values
	function replaceNodes(newTerm, parent) {
	    var newNode = new utility.BinaryNode(newTerm.result, parent, null, null);
	    var node = newTerm.node;
	    var fixedNode = newTerm.fixedNode;
	    var side = newTerm.side;
	    if (parent.parent) {
	        //Parent is not the root
	        parent[side] = newNode;
	        if (node.parent && node.parent.parent) {
	            //For each set of left/right for superparent and parent
	            //  Set parenLevel of replacing node
	            //  Replace parent node
	            //  Correct parent of node
	            //  Clean up references
	            if (node.parent.parent.left == node.parent) {
	                if (node.parent.left == node) {
	                    node.parent.right.node.parenLevel = node.parent.node.parenLevel;
	                    node.parent.parent.left = node.parent.right;
	                    node.parent.right.parent = node.parent.parent;
	                    node.parent.left = null;
	                } else {
	                    node.parent.left.node.parenLevel = node.parent.node.parenLevel;
	                    node.parent.parent.left = node.parent.left;
	                    node.parent.left.parent = node.parent.parent;
	                    node.parent.right = null;
	                }
	            } else {
	                if (node.parent.left == node) {
	                    node.parent.right.node.parenLevel = node.parent.node.parenLevel;                    
	                    node.parent.parent.right = node.parent.right;
	                    node.parent.right.parent = node.parent.parent;
	                    node.parent.left = null;
	                } else {
	                    node.parent.left.node.parenLevel = node.parent.node.parenLevel;
	                    node.parent.parent.right = node.parent.left;
	                    node.parent.left.parent = node.parent.parent;
	                    node.parent.right = null;
	                }
	            }
	        } else {
	            //Parent lacks a parent
	            if (node.parent.left == node) {
	                node.parent.right.parent = null;
	                return node.parent.right;                
	            } else {              
	                node.parent.left.parent = null;
	                return node.parent.left;                
	            }
	        }
	    } else {
	        //Replacing root
	        return newNode;
	    }

	    //Reroot tree
	    var root = newNode;
	    while (root.parent) {
	        root = root.parent;
	    } 
	    return root;
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	//Algebra calcuation module
	var algebra   = __webpack_require__(1)
	var tokenizer = __webpack_require__(13);
	var postFixer = __webpack_require__(15);
	var treeMaker = __webpack_require__(16);
	var solver    = __webpack_require__(20);
	var treeDispl = __webpack_require__(17);

	//List of enabled operations
	var operations = algebra.operations;

	//Utility library
	var utility = __webpack_require__(6);

	//Delimiter support for expressions (s.a. colorization and MathJax support)
	var delim = {
	        open: '',  //Start of expression
	        close: '', //End of expression
	        highlight: '<span style="color: #ff0000">', //Start of highlighted section
	        highlightEnd: '</span>'                     //End of highlighted section
	    };

	//Main calculation loop
	module.exports = function(left, right, calcHistory, solutionCount) {

	    //Tokenize input
	    var tokens = [tokenizer(left), tokenizer(right)];
	    var postfix = [postFixer(tokens[0]), postFixer(tokens[1])];
	    var trees = [treeMaker(postfix[0]), treeMaker(postfix[1])];
	    var solution = solver(trees[0], trees[1]);

	    //Error flag
	    var error = false;

	    //Create new output div element
	    var answerDiv = document.createElement('div');
	    answerDiv.id = 'solution ' + solutionCount;

	    //Create and add expression
	    answerDiv.innerHTML += "<br />Equation: " + delim.open + tokens[0].map(utility.tidyExpr.bind([])).join(' ') + ' = ' + tokens[1].map(utility.tidyExpr.bind([])).join(' ') + delim.close;
	    
	    //Iterate through steps
	    for(var i = 0; i < solution.steps.length; i++) {
	        //Add step description to div
	        var stepExprLeft = treeDispl(solution.steps[i].left).map(utility.tidyExpr.bind(solution.steps[i].nodes)).join(' ')
	        var stepExprRight = treeDispl(solution.steps[i].right).map(utility.tidyExpr.bind(solution.steps[i].nodes)).join(' ')
	        answerDiv.innerHTML += "<br />     Step " + (i + 1) + ": " + delim.open;
	        answerDiv.innerHTML += stepExprLeft + ' = ' + stepExprRight;

	        //Close step description
	        answerDiv.innerHTML += delim.close;
	    }
	        
	    //Add answer to div display
	    answerDiv.innerHTML += "<br />     Answer: " + delim.open + (treeDispl(solution.left)).map(utility.tidyExpr.bind([])).join(' ') + ' = ' + (treeDispl(solution.right)).map(utility.tidyExpr.bind([])).join(' ') + delim.close;

	    //Add div to dom and clear input box
	    calcHistory.appendChild(answerDiv);
	};    

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var algebra = __webpack_require__(1);
	var simplify = __webpack_require__(18);
	var utility = __webpack_require__(6);
	var Term = __webpack_require__(5);
	var operations = algebra.operations;

	module.exports = function equationSolver(left, right) {
	    var result = {steps: []};

	    if (!containsVariable(left) && containsVariable(right)) {
	        var temp = right;
	        right = left;
	        left = temp;
	    }

	    while (containsVariable(left) && left.node.type != 'variable') {
	        if (containsVariable(left.left) && containsVariable(left.right)) {
	            var simplified = simplify(left);
	            if (!simplified) {
	                return false;
	            }
	            left = simplified.result;
	            for (var i = 0; i < simplified.steps.length; i++) {
	                result.steps[i] = {};
	                result.steps[i].left = simplified.steps[i].tree;
	                result.steps[i].right = right;
	                result.steps[i].nodes = simplified.steps[i].nodes;
	            }
	        }
	        if (containsVariable(left.left)) {
	            var step = {};
	            step.left = utility.copyBranch(left);;
	            step.right = utility.copyBranch(right);
	            step.nodes = [left.node, left.right.node];
	            result.steps.push(step);
	            right = new utility.BinaryNode(new Term(operations[left.node.token].inverse, 0, 'operator'), null, right, left.right);
	            left.right.parent = right;
	            right.left.parent = right;
	            left = left.left;
	            left.parent = null;
	        } else if (containsVariable(left.right)) {
	            var step = {};
	            step.left = utility.copyBranch(left);;
	            step.right = utility.copyBranch(right);
	            step.nodes = [left.node, left.left.node];
	            result.steps.push(step);
	            right = new utility.BinaryNode(new Term(operations[left.node.token].inverse, 0, 'operator'), null, right, left.left);
	            left.left.parent = right;
	            right.left.parent = right;
	            left = left.right;
	            left.parent = null;
	        }
	    }

	    while (containsVariable(right)) {
	        //Clear variables from right side
	    }

	    //Handle coefficients
	    if (left.node.coefficient != 1) {
	        var step = {};
	        step.left = utility.copyBranch(left);;
	        step.right = utility.copyBranch(right);
	        step.nodes = [left.node];
	        result.steps.push(step);
	        right = new utility.BinaryNode(new Term('/', 0, 'operator'), null, right, null);
	        right.right = new utility.BinaryNode(new Term('', 0, 'constant', left.node.coefficient), right, null, null);
	        right.left.parent = right;
	        left.node = new Term('', left.node.parenLevel, 'variable', 1, left.node.symbol, left.node.power);
	    }

	    //Simplify results
	    var simplified = simplify(left);
	    if (simplified) {
	        left = simplified.tree;
	        for (var i = 0; i < simplified.steps.length; i++) {
	            var step = {};
	            step.left = simplified.steps[i].tree;
	            step.right = right;
	            step.nodes = simplified.steps[i].nodes;
	            result.steps.push(step);
	        }
	    }

	    var simplified = simplify(right);
	    if (simplified) {
	        right = simplified.tree;
	        for (var i = 0; i < simplified.steps.length; i++) {
	            var step = {};
	            step.left = left;
	            step.right = simplified.steps[i].tree;
	            step.nodes = simplified.steps[i].nodes;
	            result.steps.push(step);
	        }
	    }  

	    result.left = left;
	    result.right = right;

	    return result;

	};

	function containsVariable(tree) {
	    return ((tree.left ? containsVariable(tree.left) : false) ||
	            (tree.right ? containsVariable(tree.right) : false) ||
	            (tree && tree.node && tree.node.type == 'variable'));
	}

/***/ }
/******/ ]);