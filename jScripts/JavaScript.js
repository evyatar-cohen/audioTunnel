﻿loadXml();


var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
        templateUrl: "lesson.htm",
        controller: "lessonCtrl"
    })
        .when("/lesson", {
        templateUrl: "lesson.htm",
        controller: "lessonCtrl"
    });
});



app.controller("lessonCtrl", function ($scope) {
    $scope.title = lessonTitle;
    $scope.author = authorName;
    $scope.logo = courseLogo;
    //$scope.time = audioDuration;
    //$scope.src = audioSrc;
    $scope.question = interQuestion;


});

var courseLogo = "";
var lessonTitle = "";
var authorName = "";
var audioDuration="";
var audioSrc = "";
var xml;
var interactionsTCArray = [];
var z = 0;
var interQuestion = "";
var endOfBranch; //second to finish the branch take
var startAgainFrom; //go this sec when finish branch


function loadXml() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            xml = xhttp.responseXML;
            lessonData(xhttp.responseXML);
        }
    };
    xhttp.open("GET", "myTrees/myTree.xml", true);
    xhttp.send();
}

function lessonData(xml) {

    //if(user already listened this lesson)
    //{
    document.getElementById("nextBtn").removeAttribute("onclick");
    document.getElementById("nextBtn").style.opacity = 0.5;
    //}
    console.log(xml);
    //lesson title
    path = "/courses/course[1]/lessons/lesson[1]/title";
    if (xml.evaluate) {
        var titleNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var titleResult = titleNodes.iterateNext();
        while (titleResult) {
            lessonTitle += titleResult.childNodes[0].nodeValue;
            titleResult = titleNodes.iterateNext();
        }
    }

    //course author
    path = "/courses/course[1]/author";
    if (xml.evaluate) {
        var authorNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var authorResult = authorNodes.iterateNext();
        while (authorResult) {
            authorName += authorResult.childNodes[0].nodeValue;
            authorResult = authorNodes.iterateNext();
        }
    }

    //course logo
    path = "/courses/course[1]/logo";
    if (xml.evaluate) {
        var logoNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);      
        var logoResult = logoNodes.iterateNext();
        console.log(logoResult);
        while (logoResult) {
            courseLogo += logoResult.childNodes[0].nodeValue;
            logoResult = logoNodes.iterateNext();
        }
    }

    //lesson audio
    path = "/courses/course[1]/lessons/lesson[1]/audio";
    if (xml.evaluate) {
        var audioNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var audioResult = audioNodes.iterateNext();
        while (audioResult) {
            audioSrc += "Podcasts/" + audioResult.childNodes[0].nodeValue + ".mp3";

            audioDuration += audioResult.getAttribute('duration');
            audioResult = audioNodes.iterateNext();
        }
        document.getElementById("audioPod").src = audioSrc;

        document.getElementById('timeLabel').innerHTML = audioDuration;

    }

    //lesson interaction timecodes

    var interactionsCount = xml.evaluate('count(courses/course[1]/lessons/lesson[1]/interactions/interaction)', xml, null, XPathResult.ANY_TYPE, null);
    console.log("count" + interactionsCount.numberValue);


    for (var i = 1; i <= interactionsCount.numberValue; i++) {
        console.log("I" + i);
        var path = "courses/course[1]/lessons/lesson[1]/interactions/interaction[" + i + "]/STC";
        var interactionsNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var interactionsResult = interactionsNodes.iterateNext();
        interactionsTCArray[i - 1] = parseInt(interactionsResult.childNodes[0].nodeValue);
        console.log(interactionsTCArray[i - 1] + "ssss");
    }
    console.log(interactionsTCArray);
    interactionSign(interactionsTCArray);

}

function interactionSign(timeCodes) {
    var width = document.getElementById("progressBackground").offsetWidth;
    var minutes =parseInt(audioDuration.substring(0, audioDuration.indexOf(":")));
    var seconds = parseInt(audioDuration.split(':')[1]);
    var duration = minutes * 60 + seconds;

    console.log();
    console.log(width);
    console.log(duration);
    for (var i = 0; i < timeCodes.length; i++) {
        console.log(timeCodes[i]);
        var sign = document.createElement("SPAN");
        document.getElementById("progressBackground").appendChild(sign);
        sign.classList.add("interactionSign");
        sign.offsetLeft = -14;
        var percentage = timeCodes[i] * 100 / duration;
        console.log(percentage);
        var position = (percentage * width / 100)-0.2;
        console.log(position.toString());
        sign.style.left = position.toString() + "px";
    }


}


var prog;
var progress;
var increment;
var percent;
function playAudio() {
    var audio = document.getElementById("audioPod");
    audio.play();
    var duration = audio.duration;
    console.log(duration);

    prog = setInterval(advance, 100);

    progress = document.getElementById("progress");
    increment = 10 / duration;
    percent;
    function advance() {
        console.log("prog");

        if (audio.duration == audio.currentTime) {
            console.log("done");
            pauseAudio();
        }

        if(onDrag==false)
        {
            progressBar(); //progressbar update
            timeLabel(); //ltime label update
            
        }

        interactionCheck(); //check if there is interactions
        checkIfInBranch(); //check if branch mode
    }

    document.getElementById("playPauseBtn").classList.remove("playBtn");
    document.getElementById("playPauseBtn").classList.add("pauseBtn");
    document.getElementById("playPauseBtn").setAttribute('onclick', 'pauseAudio()');

}

function pauseAudio() {
    var audio = document.getElementById("audioPod");
    audio.pause();

    console.log("dsfsdfs");
    document.getElementById("playPauseBtn").classList.remove("pauseBtn");
    document.getElementById("playPauseBtn").classList.add("playBtn");
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playAudio()');

    clearInterval(prog);

}
//progressbar update
function progressBar() {
    var audio = document.getElementById("audioPod");
    percent = Math.min(increment * audio.currentTime * 10, 100);
    progress.style.width = percent + '%';

}

//time label update
var audioTime;
var minutes;
var seconds;
var secondsTxt;
var minutesTxt;
function timeLabel() {
    var audio = document.getElementById("audioPod");
    audioTime = audio.duration - audio.currentTime;
    minutes = Math.floor(audioTime / 60);
    seconds = Math.floor(audioTime % 60);
    if (minutes < 10) {
        minutesTxt = "0" + minutes.toString();
    }
    else {
        minutesTxt = minutes.toString();
    }
    if (seconds < 10) {
        secondsTxt = "0" + seconds.toString();
    }
    else {
        secondsTxt = seconds.toString();
    }
    document.getElementById('timeLabel').innerHTML = minutesTxt + ":" + secondsTxt;
}

//interactions check
function interactionCheck() {
    var audio = document.getElementById("audioPod");
    if (audio.currentTime > interactionsTCArray[z]) {
        pauseAudio();
        document.getElementById("interactionSound").play();
        z++;
        console.log("Z " + z);
        var interactionType = "";
        path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]";
        if (xml.evaluate) {
            var interactionNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
            var interactionResult = interactionNodes.iterateNext();
            while (interactionResult) {
                interactionType += interactionResult.getAttribute('type');
                console.log(interactionType);
                interactionResult = interactionNodes.iterateNext();
            }
        }
        document.getElementById("lessonInfo").style.display = "none";
        document.getElementById("lessonInteractions").style.display = "block";

        if (interactionType == "branch") {

            branch();

        }
        if (interactionType == "multi") {
            multi();
        }

        if (interactionType == "open") {
            open();
        }

        if (interactionType == "rate") {
            rate();
        }
    }

}

//check if we are in branch mode
function checkIfInBranch() {
    var audio = document.getElementById("audioPod");
    if (endOfBranch != null) {
        console.log("checkif" + endOfBranch);
        console.log("goes to" + startAgainFrom);
        if (audio.currentTime > endOfBranch) {
            audio.currentTime = startAgainFrom;
            endOfBranch = null;
        }
    }
}    


function replay10Sec() {

    //replay 10 seconds in audio
    var audio = document.getElementById('audioPod');

    audio.currentTime -= 10;


}



function next10Sec() {
    //jumping 10 seconds in audio
    var audio = document.getElementById('audioPod');

    audio.currentTime += 10;

}



function seekNext(event) {//click for seek time on progress bar
    var x = event.clientX;
    var width = document.getElementById("progressBackground").offsetWidth;
    console.log(width);
    console.log(x+"x");
    document.getElementById("progress").style.width=x+"px";
    var position = Math.floor((x /width * 100) + 1) + 1; //get percentage
    var audio = document.getElementById('audioPod');
    var seeked = position * audio.duration / 100;
    audio.currentTime = seeked;
    
    takeHandleToPosition(x);
    onDrag=false;
    
    
}


//interactions
var answersCount;

function getFTC() {
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/FTC";
    if (xml.evaluate) {
        var FTCNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var FTCResult = FTCNodes.iterateNext();
        startAgainFrom = FTCResult.childNodes[0].nodeValue;

    }
    console.log("FTC"+startAgainFrom);
}

//branch
function branch() {
    document.getElementById("playPauseBtn").removeAttribute("onclick");
    document.getElementById("playPauseBtn").style.opacity = 0.5;
    document.getElementById("branch").style.display = "block";
    document.getElementById("checkBtn").setAttribute('onclick', 'checkBranch()');
    //qustion update
    getQ();

    var aArray = [];
    //answers
    answersCount = xml.evaluate('count(courses/course[1]/lessons/lesson[1]/interactions/interaction[' + z + ']/a)', xml, null, XPathResult.ANY_TYPE, null);
    console.log("countANS"+answersCount.numberValue);
    var i1 = 0;

    for (i1 = 0; i1 < answersCount.numberValue; i1++) {
        console.log("z" + z);
        var path = "courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/a[" + (i1 + 1) + "]";
        var aNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        console.log(aNodes);
        var aResult = aNodes.iterateNext();
        console.log(aResult.childNodes[0]);
        aArray[i1] = aResult.childNodes[0].nodeValue;
    }

    for (var i = 1; i <= answersCount.numberValue; i++) {

        var divRB = document.createElement("DIV");
        divRB.classList.add("divRB");
        //document.getElementById("answers").appendChild(divRB);

        var answerRB = document.createElement("input");
        answerRB.type = "radio";
        answerRB.name = "radioBranch";
        answerRB.id = "RB" + i.toString();
        answerRB.classList.add("radio");
        answerRB.value = i.toString();
        answerRB.setAttribute('onchange', 'manageBranch(this)');
        document.getElementById("answers").appendChild(answerRB);

        var answerLabel = document.createElement("LABEL");
        answerLabel.classList.add("AnsRB");
        answerLabel.htmlFor  = "RB" + i.toString();
        answerLabel.id = "branchAns" + i.toString();
        answerLabel.innerHTML = aArray[i - 1];
        document.getElementById("answers").appendChild(answerLabel);

        //var br = document.createElement("br");
        //document.getElementById("branch").appendChild(br);


        //document.getElementById("branchAns" + i).innerHTML = aArray[i - 1];
    }
}


function checkBranch() {
    disableBtn();
    getFTC();

    var audio = document.getElementById('audioPod');
    for (var i1 = 0; i1 < answersCount.numberValue; i1++) {
        console.log(i1);
        var path = "courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/a[" + (i1 + 1) + "]";
        var aNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var correctResult = aNodes.iterateNext();
        console.log("JampTo"+correctResult.getAttribute('jumpTo'));
        console.log("RB" + (i1 + 1));
        var element = document.getElementById("RB" + (i1 + 1));
        if (element.checked == true) {
            endOfBranch = correctResult.getAttribute('until');
            var newCurrentTime = correctResult.getAttribute('jumpTo');
            if (newCurrentTime < audio.currentTime) {
                startAgainFrom = endOfBranch;
                console.log("blbal " + startAgainFrom);
                z--;
            }

        }

    }


    audio.currentTime = newCurrentTime; 
    document.getElementById("answers").innerHTML = "";
    document.getElementById("playPauseBtn").style.opacity = 1;
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playAudio()');
    document.getElementById("lessonInteractions").style.display = "none";
    document.getElementById("lessonInfo").style.display = "block";
    playAudio();
}


function manageBranch(rb)
{
    console.log("dfdf");
    var bt = document.getElementById('checkBtn');

    if(rb.checked)
    {
        bt.disabled = false;    
        bt.classList.remove("disabled");
    }

}




//multiple choice

function multi() {
    //disabel playPauseClick
    document.getElementById("playPauseBtn").removeAttribute("onclick");
    document.getElementById("playPauseBtn").style.opacity = 0.5;
    document.getElementById("multi").style.display = "block";
    document.getElementById("checkBtn").setAttribute('onclick', 'checkMulti()');

    //qustion update
    getQ();

    var aArray = [];
    //answers
    answersCount = xml.evaluate('count(courses/course[1]/lessons/lesson[1]/interactions/interaction['+z+']/a)', xml, null, XPathResult.ANY_TYPE, null);
    console.log("absC"+answersCount.numberValue);
    var i1 = 0;

    for (i1 = 0; i1 < answersCount.numberValue; i1++) {
        var path = "courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/a[" + (i1 + 1) + "]";
        var aNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var aResult = aNodes.iterateNext();
        aArray[i1] = aResult.childNodes[0].nodeValue;
    }
    console.log(aArray);
    console.log(aArray[1]);    
    for (var i = 1; i <= answersCount.numberValue; i++) {

        var divCB = document.createElement("DIV");
        divCB.classList.add("divCB");
        document.getElementById("answers2").appendChild(divCB);

        console.log("CB" + i);
        var answerCB = document.createElement("input");
        answerCB.type = "checkbox";
        answerCB.name = "checkboxMulti";
        answerCB.id = "CB" + i.toString();
        answerCB.classList.add("checkbox");
        answerCB.value = i.toString();
        answerCB.setAttribute('onchange', 'manageMulti(this)');
        divCB.appendChild(answerCB);

        var answerLabel = document.createElement("LABEL");
        answerLabel.classList.add("AnsCB");
        answerLabel.htmlFor = "CB" + i.toString();
        answerLabel.id = "multiAns" + i.toString();
        answerLabel.innerHTML = aArray[i - 1];
        divCB.appendChild(answerLabel);
    }

}



function checkMulti() {
    var countTrue = 0;
    for (var i1 = 0; i1 < answersCount.numberValue; i1++) {
        console.log(i1);
        var path = "courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/a[" + (i1 + 1) + "]";
        var aNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var correctResult = aNodes.iterateNext();
        console.log(correctResult.getAttribute('correct'));
        if (document.getElementById("CB" + (i1 + 1)).checked == true && correctResult.getAttribute('correct') == "true") {
            countTrue++;
        }
        if (document.getElementById("CB" + (i1 + 1)).checked == false && correctResult.getAttribute('correct') == "false") {
            countTrue++;
        }

    }
    var TOF;
    if (countTrue == answersCount.numberValue) {
        TOF = true;
    }
    else {
        TOF = false;
    }

    document.getElementById("lessonInfo").style.display = "none";
    document.getElementById("answers2").innerHTML = "";
    document.getElementById("multi").style.display = "none";
    afterAnswer(TOF);

}

function afterAnswer(right) {

    disableBtn();

    document.getElementById("lessonInteractions").style.display = "none";
    document.getElementById("lessonInfo").style.display = "block";



    var audio = document.getElementById('audioPod');

    if (right == true) {
        console.log("goodJob");
    }
    else {
        console.log("jara");
    }

    document.getElementById("playPauseBtn").style.opacity = 1;
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playAudio()');
    playAudio();
}


function manageMulti(cb)
{
    var bt = document.getElementById('checkBtn');

    if(cb.checked)
    {
        bt.disabled = false;    
        bt.classList.remove("disabled");
    }
    else
    {
        for (i1 = 0; i1 < answersCount.numberValue; i1++) {
            if(document.getElementById("CB" + (i1 + 1)).checked==false)
            {
                bt.disabled=true;
                bt.classList.add("disabled");
            }
        }
    }
}


//open answer interaction
function open()
{
    document.getElementById("playPauseBtn").removeAttribute("onclick");
    document.getElementById("playPauseBtn").style.opacity = 0.5;
    document.getElementById("open").style.display = "block";
    document.getElementById("checkBtn").setAttribute('onclick', 'getOpen()');

    getQ();


}

function getOpen() {

    disableBtn();

    var studentAnswer = document.getElementById("TextArea1").value;
    console.log(studentAnswer);
    document.getElementById("TextArea1").value = "";
    document.getElementById("open").style.display = "none";
    document.getElementById("lessonInteractions").style.display = "none";
    document.getElementById("lessonInfo").style.display = "block";
    document.getElementById("playPauseBtn").style.opacity = 1;
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playAudio()');
    playAudio();
}

function manage(txt)
{
    var bt = document.getElementById('checkBtn');
    if (txt.value != '') {
        bt.disabled = false;
        bt.classList.remove("disabled");
    }
    else {
        bt.disabled = true;
        bt.classList.add("disabled");
    }
}

var max; var min;
//rate interaction 
function rate() {
    document.getElementById("playPauseBtn").removeAttribute("onclick");
    document.getElementById("playPauseBtn").style.opacity = 0.5;
    document.getElementById("rate").style.display = "block";
    document.getElementById("checkBtn").setAttribute('onclick', 'getRate()');
    getQ();

    rateMinText = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/min/text";
    var rateMinTextNode = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
    var rateMinTextResult = rateMinTextNode.iterateNext();
    rateMinText = rateMinTextResult.childNodes[0].nodeValue;
    var scope1 = angular.element(document.getElementById("minWords")).scope();
    scope1.minWords = rateMinText;
    scope1.$apply();

    rateMinNum = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/min/num";
    var rateMinNumNode = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
    var rateMinNumResult = rateMinNumNode.iterateNext();
    rateMinNum = rateMinNumResult.childNodes[0].nodeValue;
    min = parseInt(rateMinNum);
    var scope2 = angular.element(document.getElementById("minNum")).scope();
    scope2.minNum = rateMinNum;
    scope2.$apply();
    var scope22 = angular.element(document.getElementById("myRange")).scope();
    scope22.minNum = rateMinNum;
    scope22.$apply();
    var scope23 = angular.element(document.getElementById("rateIntput")).scope();
    scope23.minNum = rateMinNum;
    scope23.$apply();

    rateMaxText = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/max/text";
    var rateMaxTextNode = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
    var rateMaxTextResult = rateMaxTextNode.iterateNext();
    rateMaxText = rateMaxTextResult.childNodes[0].nodeValue;
    var scope3 = angular.element(document.getElementById("maxWords")).scope();
    scope3.maxWords = rateMaxText;
    scope3.$apply();

    rateMaxNum = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/max/num";
    var rateMaxNumNode = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
    var rateMaxNumResult = rateMaxNumNode.iterateNext();
    rateMaxNum = rateMaxNumResult.childNodes[0].nodeValue;
    max = parseInt(rateMaxNum);
    var scope4 = angular.element(document.getElementById("maxNum")).scope();
    scope4.maxNum = rateMaxNum;
    scope4.$apply();
    var scope42 = angular.element(document.getElementById("myRange")).scope();
    scope42.maxNum = rateMaxNum;
    scope42.$apply();


}


function getRateValue() {
    document.getElementById("rateIntput").innerHTML = document.getElementById("myRange").value;
}

function getRate() {
    disableBtn();

    var studentRate = document.getElementById("myRange").value;;
    console.log(studentRate);
    document.getElementById("rate").style.display = "none";
    document.getElementById("lessonInteractions").style.display = "none";
    document.getElementById("lessonInfo").style.display = "block";
    document.getElementById("playPauseBtn").style.opacity = 1;
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playAudio()');
    playAudio();
}

function manageRate(slider){
    var bt = document.getElementById('checkBtn');
    bt.disabled = false;
    bt.classList.remove("disabled");

}


//write the question to label
function getQ() {
    interQuestion = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/q";
    if (xml.evaluate) {
        var interactionNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var interactionResult = interactionNodes.iterateNext();
        while (interactionResult) {
            interQuestion += interactionResult.childNodes[0].nodeValue;
            interactionResult = interactionNodes.iterateNext();
            console.log(interQuestion);
        }
    }
    var scope1 = angular.element(document.getElementById("question")).scope();
    scope1.q = interQuestion;
    scope1.$apply();
}


function disableBtn(){
    document.getElementById('checkBtn').classList.add('disabled');
    document.getElementById('checkBtn').disabled = true;
}



interact('#progress')
    .resizable({
    // resize from all edges and corners
    edges: { left: false, right: true, bottom: false, top: false },

    listeners: {
        move (event) {
            var target = event.target
            var x = (parseFloat(target.getAttribute('data-x')) || 0)
            var y = (parseFloat(target.getAttribute('data-y')) || 0)

            // update the element's style
            target.style.width = event.rect.width + 'px'
            target.style.height = event.rect.height + 'px'

            // translate when resizing from top or left edges
            x += event.deltaRect.left
            y += event.deltaRect.top

            target.style.webkitTransform = target.style.transform =
                'translate(' + x + 'px,' + y + 'px)'

            target.setAttribute('data-x', x)
            target.setAttribute('data-y', y)
            takeHandleToPosition(target.style.width);
            

        },
        end(event)
        {
            var target = event.target
            target.style.width = event.rect.width + 'px'
            takeHandleToPosition(target.style.width);
            var audio = document.getElementById('audioPod');
            audio.currentTime=takeHandleToPosition(target.style.width);
            onDrag=false;
            console.log("bye")
            
        }
    },
    modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
            outer: 'parent'
        }),

        // minimum size
        interact.modifiers.restrictSize({
            min: { width: 2, height: 12 }
        })
    ],

    inertia: true
})

var onDrag=false;
function takeHandleToPosition(position)
{
    onDrag=true;
    console.log(onDrag);
    var positionNum=parseInt(position);
    var width = document.getElementById("progressBackground").offsetWidth;
    var audio = document.getElementById('audioPod');
    var percentage = positionNum / width;
    var seeked=Math.round(percentage*audio.duration);
    
    audioTime = audio.duration - seeked;
    var minutes = Math.floor(audioTime / 60);
    var seconds = Math.floor(audioTime % 60);
    
    
    
    if (minutes < 10) {
        minutesTxt = "0" + minutes.toString();
    }
    else {
        minutesTxt = minutes.toString();
    }
    if (seconds < 10) {
        secondsTxt = "0" + seconds.toString();
    }
    else {
        secondsTxt = seconds.toString();
    }
    document.getElementById('timeLabel').innerHTML = minutesTxt + ":" + secondsTxt;
    
       return seeked;
    
}



//for the drag




//const position = { x: 0, y: 0 }
//interact('.draggable').draggable({
//    modifiers: [
//        interact.modifiers.restrictRect({
//            restriction: 'parent'
//        })
//    ],
//    listeners: {
//        start(event) {
//            console.log(event.type, event.target)
//        },
//        move(event) {
//            position.x += event.dx
//            position.y += event.dy
//            console.log(position.x)
//            event.target.style.transform =
//                `translate(${position.x}px, ${position.y}px)`
//        },
//    },
//    lockAxis: 'x'
//});


