import 'dart:html';
import 'dart:convert';

var tableHeaders = ["fred", "george"];
var jsonObject, currentStep, variableLength, currentLine;

//Templates
var tableTitlesTemplate = [
  "<tr id='walkthrough-header'><th class='center'>Step<br>Number</th><th class='center'>Next Line</th>", 
  "<th class='center'>{variable}<br>&#x2193;</th>",
  "</tr>"
];
var tableStateTemplate = [
  "<tr><th class='center' id='currentStepNumber'></th><th class='center' id='currentLineNumber'></th>",
  "<th class='center'></th>",
  "</tr>"
];
var tableNextStateTemplate = [
  "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='stepNumber'>1</span></td><td><input type='text' id='lineNumber' placeholder='?'></td>",
  "<td><input type='text' id='v{varNum}' placeholder='?'></td>",
  "</tr>"
];

//Main Method
void main() {
  currentStep = 1;
  window.localStorage.clear();
  
  querySelector('#back').onClick.listen((event) => stepBack());
  querySelector('#submit').onClick.listen((event) => submit());
  querySelector('#forward').onClick.listen((event) => stepForward());
  
  parseAnswers("code.json");
}


void parseAnswers(String file) {
  HttpRequest.request(file).then((req) {
      onDataLoaded(req);
      currentLine = jsonObject[currentStep-1]["line"];
      querySelector('#feedback').innerHtml = jsonObject[currentStep-1]["message"].toString();
      variableLength = jsonObject.length;
      //Request for sample code
      getSampleCode("code.txt");
      //Request for variables
      generateVarTable("test.txt");
  });
}


void onDataLoaded(HttpRequest req) {
  try {
    jsonObject = JSON.decode(req.responseText);
  } catch (ex) {
    window.alert(ex.toString());
  }
}


void getSampleCode(String file) {
  HttpRequest.getString(file).then((String contents) {
    querySelector('#code').innerHtml = processSnippet(contents);
  }).catchError((Error error) {
    window.alert(error.toString());
  });
}


String processSnippet(String contents) {
  var lines = contents.split("\n"), snippet = "<pre><code>";
  for (var i=0; i < lines.length; i++) {
    if (i+1 == currentLine) {
      snippet += ">> " + (i+1).toString() + ". " + lines[i] + "\n";
    } else {
      snippet += "   " + (i+1).toString() + ". " + lines[i] + "\n";
    }
  }
  return snippet + "</code></pre>";
}


void refreshSnippet() {
  currentLine = jsonObject[currentStep-1]["line"];
  getSampleCode("code.txt");
}


void submit() {
  HttpRequest.request("code.json").then((req) {
    checkResults(req);
  });
}


void stepBack() {
  if (currentStep == 1) {
    window.alert("You cannot step back any further.");
  } else {
    currentStep--;
    var json = window.localStorage['step'+currentStep.toString()];
    if (json != null) {
      try {
        querySelector('#stepNumber').innerHtml = currentStep.toString();
        clearEditables();
        populateEditables(JSON.decode(json));
        refreshSnippet();
      } catch (e) {
        window.console.log('Could not load json from the local storage. ${e}');
      }
    }
  }
}


void stepForward() {
  if (currentStep >= jsonObject.length) {
    window.alert("You cannot step forward any further.");
  } else {
    if (window.localStorage['step'+(currentStep).toString()] != null) {
      currentStep++;
      querySelector('#stepNumber').innerHtml = currentStep.toString();
      clearEditables();
      var json = window.localStorage['step'+(currentStep).toString()];
      if (json != null) {
        populateEditables(JSON.decode(json));
      }
      refreshSnippet();
    } else {
      window.alert("You must completed this step of the exercise before moving to the next step.");
    }
  }
}


void populateEditables(var json) {
  var line = querySelector('#lineNumber');
  line.value = json["line"];
  for (var i = 1; i <= variableLength; i++) {
    var currentVar = querySelector('#v' + i.toString());
    currentVar.value = json['v'+i.toString()];
  }
}


void checkResults(HttpRequest req) {
  var line = querySelector('#lineNumber'), resultsMessage, answers = {}, errorFlag = false;
  onDataLoaded(req);
  if (line.value == jsonObject[currentStep-1]['line'].toString()) {
    answers['line'] = line.value;
    for (var i = 1; i <= variableLength; i++) {
      var currentVar = querySelector('#v' + i.toString());
      answers['v' + i.toString()] =  currentVar.value;
      if (currentVar.value == jsonObject[currentStep-1]['var'+i.toString()]) {
        resultsMessage = "Correct. Good Job!";
        continue;
      } else {
        resultsMessage = jsonObject[currentStep-1]['feedback']['var'+i.toString()];
        errorFlag = true;
        break;
      }
    }
    querySelector('#feedback').innerHtml = resultsMessage;
    if (!errorFlag) {
      window.localStorage['step'+currentStep.toString()] = JSON.encode(answers);
      step();
    }
  } else {
    querySelector('#feedback').innerHtml = "Pay attention to what line is highlighted. The step number is not necessarily the line number.";
  }
}


void step() {
  if (currentStep > jsonObject.length) {
    window.alert("You have already completed this exercise. Please continue on to the next exercise.");
  } else {
    currentStep++;
    if (currentStep <= jsonObject.length) {
      querySelector('#stepNumber').innerHtml = currentStep.toString();
      clearEditables();
      currentLine = jsonObject[currentStep-1]["line"];
      getSampleCode("code.txt");
    } else {
      window.alert("Congratulations, you have completed this exercise!");
      clearEditables();
      querySelector('#stepNumber').innerHtml = "";
    }
  }
}


void clearEditables() {
  var line = querySelector('#lineNumber'), currentVar;
  line.value = "";
  for (var i = 1; i <= variableLength; i++) {
    currentVar = querySelector('#v' + i.toString());
    currentVar.value = "";
  }
}


void generateVarTable(String file) {
  HttpRequest.getString(file).then((String fileContents) {
        var tableTitlesHtml, tableStateHtml, tableNextStateHtml;
        List testList = new List();
        testList = fileContents.split(' ');
        
        //Table Titles
        tableTitlesHtml = tableTitlesTemplate[0];
        for (var item in tableHeaders) {
          tableTitlesHtml += tableTitlesTemplate[1].replaceAll(new RegExp(r"{.*}"), item);
        }
        tableTitlesHtml += tableTitlesTemplate[2];
        
        //Table States
        tableStateHtml = tableStateTemplate[0];
        for (var item in tableHeaders) {
          tableStateHtml += tableStateTemplate[1];
        }
        tableStateHtml += tableStateTemplate[2];
        
        //Table Next State
        tableNextStateHtml = tableNextStateTemplate[0];
        for (var i = 1; i < tableHeaders.length + 1; i++) {
          tableNextStateHtml += tableNextStateTemplate[1].replaceAll(new RegExp(r"{.*}"), i.toString());
        }
        tableNextStateHtml += tableNextStateTemplate[2];
        querySelector('#table').innerHtml = '<table><tbody><tr><th></th><th></th><th>Variables:</th></tr>' + tableTitlesHtml + tableStateHtml + tableNextStateHtml + '</tbody></table>';
    }).catchError((Error error) {
      window.alert(error.toString());
    });
}












