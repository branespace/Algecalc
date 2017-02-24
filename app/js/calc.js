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
var simplifyExpr = function() {

    require('./simplifyExpr.js')(inputField.value, calcHistory, solutionCount);

    inputField.value = '';

    //Increment solution count for naming div
    solutionCount++;
};

var solveEquation = function() {
    var inputs = inputField2.value.split('=');

    require('./solveEquation.js')(inputs[0], inputs[1], calcHistory2, solutionCount);

    inputField2.value = '';

    //Increment solution count for naming div
    solutionCount++;  
};