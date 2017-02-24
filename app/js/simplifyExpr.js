//Algebra calcuation module
var algebra = require('./algebra/algebra.js')

//List of enabled operations
var operations = algebra.operations;

//Utility library
var utility = require('./utility/utility.js');

//Delimiter support for expressions (s.a. colorization and MathJax support)
var delim = {
        open: '',  //Start of expression
        close: '', //End of expression
        highlight: '<span style="color: #ff0000">', //Start of highlighted section
        highlightEnd: '</span>'                     //End of highlighted section
    };

//Main calculation loop
module.exports = function(input, calcHistory, solutionCount) {
    var tokenizer = require('./algebra/exprStringToTokenizedArray.js');

    //Tokenize input
    var tokenArray = tokenizer(input);

    //Error flag
    var error = false;

    //Create new output div element
    var answerDiv = document.createElement('div');
    answerDiv.id = 'solution ' + solutionCount;

    var postfix = (require('./algebra/tokenToPostfix.js')(tokenArray.slice()));
    var binaryTree = (require('./algebra/postfixToBinaryTree.js')(postfix.slice()));
    var tokenizedArray = (require('./algebra/binaryTreeToTokenizedArray.js')(binaryTree));
    var evaluated = (require('./algebra/evaluateBinaryTree.js')(binaryTree));

    //Create and add expression and RPN string
    answerDiv.innerHTML += "<br />Expression: " + delim.open + tokenArray.map(utility.tidyExpr.bind([])).join(' ') + delim.close;
    
    //Iterate through steps
    for(var i = 0; i < evaluated.steps.length; i++) {
        //Add step description to div
        var stepExpr = require('./algebra/binaryTreeToTokenizedArray.js')(evaluated.steps[i].tree);
        answerDiv.innerHTML += "<br />     Step " + (i + 1) + ": " + delim.open;
        answerDiv.innerHTML += stepExpr.map(utility.tidyExpr.bind(evaluated.steps[i].nodes)).join(' ');

        //Close step description
        answerDiv.innerHTML += delim.close;
    }
        
    //Add answer to div display
    answerDiv.innerHTML += "<br />     Answer: " + delim.open + (require('./algebra/binaryTreeToTokenizedArray.js')(evaluated.tree)).map(utility.tidyExpr.bind([])).join(' ') + delim.close;

    //Add div to dom and clear input box
    calcHistory.appendChild(answerDiv);
};    