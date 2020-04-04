loadXml();


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
        document.getElementById("progressBar").appendChild(sign);
        sign.classList.add("interactionSign");
        
        var percentage = timeCodes[i] * 100 / duration;
        console.log(percentage);
        var position = (percentage * width / 100)-0.2;
        console.log(position.toString());
        sign.style.left = position.toString() + "px";
    }


}

function playPauseAudio() {
    //play/stop the audio. progressbar buffer and time label
    var timer;
    var percent = 0;
    var audio = document.getElementById('audioPod');
    audio.addEventListener("playing", function (_event) {
        var duration = audio.duration;

        console.log(duration);
        advance(duration, audio);


    });

    var startTimer = function (duration, element) {
        if (percent < 100) {
            timer = setTimeout(function () { advance(duration, element) }, 100);

        }

    }

    var advance = function (duration, element) {
        var progress = document.getElementById("progress");
        increment = 10 / duration
        percent = Math.min(increment * element.currentTime * 10, 100);
        progress.style.width = percent + '%'
        startTimer(duration, element);


    }


    //checking for interactions
    var intervalInteractions = setInterval(interactionCheck, 1000);
    function interactionCheck(){
        
        console.log("TIME CODES"+interactionsTCArray[z]);
            if (audio.currentTime > interactionsTCArray[z]) {
                audio.pause();
                document.getElementById("interactionSound").play();
                clearInterval(myVar);
                clearInterval(interactionCheck);
                document.getElementById("playPauseBtn").classList.add("playBtn");
                document.getElementById("playPauseBtn").classList.remove("pauseBtn");
                z++;  
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
                    getFTC();
                    branch();

                }
                if (interactionType == "multi") {
                    multi();
                }
                
                if (interactionType == "open") {
                    open();
                }
            }
    }

    //checking if it is an audio branch. if in branch, when the take is over it goes to startAgainFrom
    var ifBranch = setInterval(checkIfInBranch, 1000);
    function checkIfInBranch() {
        if (endOfBranch != null) {
            console.log("checkif" + endOfBranch);
            console.log("goes to" + startAgainFrom);
            if (audio.currentTime > endOfBranch) {
                audio.currentTime = startAgainFrom;
                endOfBranch = null;
            }
        }
    }

    var myVar = setInterval(function () {
      
        var audioTime = audio.duration - audio.currentTime;
       
        var minutes = Math.floor(audioTime / 60);
        var seconds = Math.floor(audioTime % 60);
        var secondsTxt = 0;
        var minutesTxt = 0;
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
    }, 1000);



    if (audio.paused) {
        audio.play();
        document.getElementById("playPauseBtn").classList.remove("playBtn");
        document.getElementById("playPauseBtn").classList.add("pauseBtn");
        clearTimeout(timer);


    } else {
        audio.pause();
        clearInterval(myVar);
        clearInterval(intervalInteractions);
        clearInterval(ifBranch);
        document.getElementById("playPauseBtn").classList.add("playBtn");
        document.getElementById("playPauseBtn").classList.remove("pauseBtn");
        

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
    var x = event.clientX - 10;
    var width = document.getElementById("progressBackground").offsetWidth;
    console.log(width);
    var position = Math.floor((x /width * 100) + 1) + 1; //get percentage
    var audio = document.getElementById('audioPod');
    var seeked = position * audio.duration / 100;
    audio.currentTime = seeked;
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
    interQuestion = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/q";
    if (xml.evaluate) {
        var interactionNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var interactionResult = interactionNodes.iterateNext();
        while (interactionResult) {
            interQuestion += interactionResult.childNodes[0].nodeValue;
            interactionResult = interactionNodes.iterateNext();
        }
    }
    var scope1 = angular.element(document.getElementById("question")).scope();
    scope1.q = interQuestion;
    scope1.$apply();
    
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
    
    for (var i1 = 0; i1 < answersCount.numberValue; i1++) {
        console.log(i1);
        var path = "courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/a[" + (i1 + 1) + "]";
        var aNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var correctResult = aNodes.iterateNext();
        console.log("JampTo"+correctResult.getAttribute('jumpTo'));
        console.log("RB" + (i1 + 1));
        var element = document.getElementById("RB" + (i1 + 1));
        if (element.checked == true) {
            var newCurrentTime = correctResult.getAttribute('jumpTo');
            endOfBranch = correctResult.getAttribute('until');
            console.log("endofbranch" + endOfBranch);
            console.log("endof");
            
        }

    }
    var audio = document.getElementById('audioPod');
    audio.currentTime = newCurrentTime;
    document.getElementById("playPauseBtn").style.opacity = 1;
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playPauseAudio()');
    document.getElementById("lessonInteractions").style.display = "none";
    document.getElementById("lessonInfo").style.display = "block";
    playPauseAudio();
}






//multiple choice

function multi() {
    //disabel playPauseClick
    document.getElementById("playPauseBtn").removeAttribute("onclick");
    document.getElementById("playPauseBtn").style.opacity = 0.5;
    document.getElementById("multi").style.display = "block";
    document.getElementById("checkBtn").setAttribute('onclick', 'checkMulti()');
    
    //qustion update
    interQuestion = "";
    path = "/courses/course[1]/lessons/lesson[1]/interactions/interaction[" + z + "]/q";
    if (xml.evaluate) {
        var interactionNodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
        var interactionResult = interactionNodes.iterateNext();
        while (interactionResult) {
            interQuestion += interactionResult.childNodes[0].nodeValue;
            interactionResult = interactionNodes.iterateNext();
        }
    }
    var scope1 = angular.element(document.getElementById("question")).scope();
    scope1.q = interQuestion;
    scope1.$apply();

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
    document.getElementById("multi").style.display = "none";
    afterAnswer(TOF);

}

function afterAnswer(right) {
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
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playPauseAudio()');
    playPauseAudio();
}



//rate interaction
function open()
{
    document.getElementById("playPauseBtn").removeAttribute("onclick");
    document.getElementById("playPauseBtn").style.opacity = 0.5;
    document.getElementById("open").style.display = "block";
    document.getElementById("checkBtn").setAttribute('onclick', 'getOpen()');

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

function getOpen() {

    var studentAnswer = document.getElementById("TextArea1").value;
    console.log(studentAnswer);
    document.getElementById("open").style.display = "none";
    document.getElementById("lessonInteractions").style.display = "none";
    document.getElementById("lessonInfo").style.display = "block";
    document.getElementById("playPauseBtn").style.opacity = 1;
    document.getElementById("playPauseBtn").setAttribute('onclick', 'playPauseAudio()');
    playPauseAudio();
}

interact('.slider')    // target elements with the 'slider' class
    .draggable({                        // make the element fire drag events
        origin: 'self',                   // (0, 0) will be the element's top-left
        inertia: true,                    // start inertial movement if thrown
        modifiers: [
            interact.modifiers.restrict({
                restriction: 'self'           // keep the drag coords within the element
            })
        ]
    })
    .on('dragmove', function (event) {  // call this listener on every dragmove
        const sliderWidth = interact.getElementRect(event.target.parentNode).width
        const value = event.pageX / sliderWidth

        event.target.style.paddingLeft = (value * 100) + '%'
        event.target.setAttribute('data-value', value.toFixed(2))
    })