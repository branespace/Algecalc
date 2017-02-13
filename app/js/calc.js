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
    var binaryTree = (require('./algebra/postfixToBinaryTree.js')(postfix.slice()));
    var tokenizedArray = (require('./algebra/binaryTreeToTokenizedArray.js')(binaryTree));
    var evaluated = (require('./algebra/evaluateBinaryTree.js')(binaryTree));

    //Create and add expression and RPN string
    answerDiv.innerHTML += "<br />Expression: " + delim.open + tokenArray.map(tidyExpr.bind([])).join(' ') + delim.close;
    
    //Perform calculation
    //var calculation = calculateVal(expr);
    //Iterate through steps
    for(var i = 0; i < evaluated.steps.length; i++) {
        //Add step description to div
        var stepExpr = require('./algebra/binaryTreeToTokenizedArray.js')(evaluated.steps[i].tree);
        answerDiv.innerHTML += "<br />     Step " + (i + 1) + ": " + delim.open;
        answerDiv.innerHTML += stepExpr.map(tidyExpr.bind(evaluated.steps[i].nodes)).join(' ');

        //Close step description
        answerDiv.innerHTML += delim.close;
    }
        
    //Add answer to div display
    answerDiv.innerHTML += "<br />     Answer: " + delim.open + (require('./algebra/binaryTreeToTokenizedArray.js')(evaluated.tree)).map(tidyExpr.bind([])).join(' ') + delim.close;

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