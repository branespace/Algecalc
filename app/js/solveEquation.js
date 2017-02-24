//Algebra calcuation module
var algebra   = require('./algebra/algebra.js')
var tokenizer = require('./algebra/exprStringToTokenizedArray.js');
var postFixer = require('./algebra/tokenToPostfix.js');
var treeMaker = require('./algebra/postfixToBinaryTree.js');
var solver    = require('./algebra/equationSolver.js');
var treeDispl = require('./algebra/binaryTreeToTokenizedArray.js');

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