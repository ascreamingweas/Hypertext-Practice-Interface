/**** Templates Section Start ****/
var varTemplate = [
    "<div id='variable{num}' class='variables'>",
    "<b>Variable {num}</b><br/>Variable name: <input type='text' id='var{num}Name'/>&nbsp;<a class='link' onclick='removeVariable(this);'>Remove</a>",
    "<hr></div>"
];
var stepTemplate = [
    "<div id='step{num}' class='steps'><table>",
    "<tr><td><h3>Step {num}</h3></td></tr>" + 
    "<tr><td>Current Line:</td><td><input type='text' id='step{num}-currentline'/></td></tr>" +
    "<tr><td>Next Expected Line:</td><td><input type='text' id='step{num}-nextline'/></td></tr>" +
    "<tr><td><b>Variables:</b></td></tr>{variables}" +
    "<tr><td><b>Feedback:</b></td></tr>{feedback}" +
    "<tr><td><b>Help:</b></td></tr>{help}",
    "</table><a class='link' onclick='removeStep(this);'>Remove</a><hr></div>"
];
var varStepTemplate = [
    "<tr><td>Value for ({varName}):</td><td><input type='text' id='step{num}-{varName}-value'/></td></tr>",
    "<tr><td>Feedback for ({varName}):</td><td><textarea id='step{num}-{varName}-feedback' rows='2' cols='60'></textarea></td></tr>",
    "<tr><td>Help for ({varName}):</td><td><textarea id='step{num}-{varName}-help' rows='2' cols='60'></textarea></td></tr>"
];
/**** Templates Section End ****/

/**** Global variable init ****/
var numVars = 0, numSteps = 0, iframe;

/**** Error Handling ****/
function handleDeletion() {
    var conf = confirm("Warning! If you continue, you will erase all existing steps. Click 'Ok' if you want to continue, otherwise click 'Cancel'.");
    return conf;
}

/**** Initialize ****/
function main() {
    //Initialize with one default variable
    addVariable();
}

/**** Append new variable ****/
function addVariable() {
    if (numSteps > 0) {
        var proceed = handleDeletion();
        if (!proceed) {
            alert("You have chosen not to add a variable.");
            return;
        } else {
            clearSteps();
        }
    }
    numVars++;
    var varHTML = varTemplate[0] + varTemplate[1];
    var matches = varHTML.match(/\{([^}]*)\}/g);
    for (var match in matches) {
        varHTML = varHTML.replace(matches[match], numVars.toString());
    }
    varHTML += varTemplate[2];
    var div = document.createElement('div');
    div.innerHTML = varHTML;
    document.getElementById("variableArea").appendChild(div);
}

/**** Remove variable (by reference) ****/
function removeVariable(ob) {
    if (numSteps > 0) {
        var proceed = handleDeletion();
        if (!proceed) {
            alert("You have chosen not to remove this variable.");
            return;
        } else {
            clearSteps();
        }
    }
    numVars--;
    ob.parentNode.remove();
}

/**** Clear all variables ****/
function clearVariables() {
    numVars = 0;
    document.getElementById("variableArea").innerHTML = "";
}

/**** Append new step ****/
function addStep() {
    numSteps++;
    var stepHTML = stepTemplate[0] + stepTemplate[1];
    var matches = stepHTML.match(/\{([^}]*)\}/g);
    for (var match in matches) {
        if (matches[match] == "{variables}") {
            stepHTML = stepHTML.replace(matches[match], getStepVariables(numSteps));
        } else if (matches[match] == "{feedback}") {
            stepHTML = stepHTML.replace(matches[match], getStepVarFeedback(numSteps));
        } else if (matches[match] == "{help}") {
            stepHTML = stepHTML.replace(matches[match], getStepVarHelp(numSteps));
        } else {
            stepHTML = stepHTML.replace(matches[match], numSteps.toString());
        }
    }
    stepHTML += stepTemplate[2];
    var div = document.createElement('div');
    div.innerHTML = stepHTML;
    document.getElementById("stepArea").appendChild(div);
}

/**** Remove step (by reference) ****/
function removeStep(ob) {
    var conf = confirm("Are you sure you want to delete this step?");
    if (conf) {
        numSteps--;
        ob.parentNode.remove();
    } else {
        alert("You have chosen not to remove this step.");
    }
}

/**** Clear all steps ****/
function clearSteps() {
    numSteps = 0;
    document.getElementById("stepArea").innerHTML = "";
}

/***************************/
/**** Utility Functions ****/
/***************************/
function getVariables() {
    var variables = [];
    if (numVars < 1) {
        alert("Cannot continue with fewer than 1 variable(s)!");
    } else {
        for (var i = 1; i < numVars+1; i++) {
            variables.push(document.getElementById("var" + i.toString() + "Name").value);
        }
    }
    return variables;
}

function getStepVariables(step) {
    var stepsHTML = "";
    var variables = getVariables();
    for (var v in variables) {
        stepsHTML += varStepTemplate[0];
        var matches = stepsHTML.match(/\{([^}]*)\}/g);
        for (var m in matches) {
            if (matches[m] == "{varName}") {
                stepsHTML = stepsHTML.replace(matches[m], variables[v]);
            } else {
                stepsHTML = stepsHTML.replace(matches[m], step.toString());
            }
        }
    }
    return stepsHTML;
}

function getStepVarFeedback(step) {
    var stepsHTML = "";
    var variables = getVariables();
    for (var v in variables) {
        stepsHTML += varStepTemplate[1];
        var matches = stepsHTML.match(/\{([^}]*)\}/g);
        for (var m in matches) {
            if (matches[m] == "{varName}") {
                stepsHTML = stepsHTML.replace(matches[m], variables[v]);
            } else {
                stepsHTML = stepsHTML.replace(matches[m], step.toString());
            }
        }
    }
    return stepsHTML;
}

function getStepVarHelp(step) {
    var stepsHTML = "";
    var variables = getVariables();
    for (var v in variables) {
        stepsHTML += varStepTemplate[2];
        var matches = stepsHTML.match(/\{([^}]*)\}/g);
        for (var m in matches) {
            if (matches[m] == "{varName}") {
                stepsHTML = stepsHTML.replace(matches[m], variables[v]);
            } else {
                stepsHTML = stepsHTML.replace(matches[m], step.toString());
            }
        }
    }
    return stepsHTML;
}

//function getVariables() {
//    var vars = [];
//    for (var i = 1; i < numVars + 1; i++) {
//        vars.push(document.getElementById("var" + i.toString() + "Name").value);
//    }
//    return vars;
//}

function buildVarJSON(vars, step) {
    var variables = {};
    for (var v in vars) {
        variables[vars[v]] = document.getElementById("step" + step.toString() + "-" + vars[v] + "-value").value;
    }
    return variables;
}

function buildFeedbackJSON(vars, step) {
    var feedback = {};
    for (var v in vars) {
        feedback[vars[v]] = document.getElementById("step" + step.toString() + "-" + vars[v] + "-feedback").value;
    }
    return feedback;
}

function buildHelpJSON(vars, step) {
    var help = {};
    for (var v in vars) {
        help[vars[v]] = document.getElementById("step" + step.toString() + "-" + vars[v] + "-help").value;
    }
    return help;
}

function buildStepJSON(step, message, variables) {
    var stepJSON = {
        'step':step,
        'line':parseInt(document.getElementById("step" + step.toString() + "-currentline").value),
        'nextline':parseInt(document.getElementById("step" + step.toString() + "-nextline").value),
        'variables':buildVarJSON(variables, step),
        'message':message,
        'feedback':buildFeedbackJSON(variables, step),
        'help':buildHelpJSON(variables, step)
    };
    return stepJSON;
}

/**** Http Request Function (JSON) ****/
function submitJSON(jsonString) {
    var req = new XMLHttpRequest();
    req.open("POST", "writeJSON.php", true);
    req.setRequestHeader("Content-type", "application/json");
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            alert("File submitted successfully.");
        } else if (req.readyState === 4 && req.status === 404) {
            alert("File submission error");
        }
    }
    req.send(jsonString);
}

/**** Http Request Function (String) ****/
function submitString(string) {
    var req = new XMLHttpRequest();
    req.open("POST", "writeString.php", true);
    req.setRequestHeader("Content-type", "text/plain");
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            alert("Variables saved and submitted.");
        } else if (req.readyState === 4 && req.status === 404) {
            alert("File submission error");
        }
    }
    req.send(string);
}

/**** Final Submission Function ****/
function convertAndSubmit() {
    var jsonOb = [];
    //Add numVars
    jsonOb.push({'numVars': numVars});
    //Get default message
    var message = document.getElementById("defaultMessage").value;
    var variables = getVariables();
    for (var i = 1; i < numSteps + 1; i++) {
        jsonOb.push(buildStepJSON(i, message, variables));
    }
    submitJSON(JSON.stringify(jsonOb));
}

/**** Variable Set Submit ****/
function saveVariables() {
    var varString = "", variables = getVariables();
    for (var v in variables) {
        varString += variables[v] + " ";
    }
    varString = varString.substring(0, varString.length - 1);
    submitString(varString);
}