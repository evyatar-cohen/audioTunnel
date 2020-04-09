var seeking =false;
var seekto;
function func1() {
    var audio = document.getElementById("example");
    var progressbar = document.getElementById("progressExample");
    audio.play();
    progressbar.max = Math.round(audio.duration);
    progressbar.addEventListener("mousedown", function(event){seeking=true; seek(event);})
    progressbar.addEventListener("mousemove", function(event){seek(event);})
    progressbar.addEventListener("mouseup", function(event){seeking=false;})
}

function seek(event)
{
    var audio = document.getElementById("example");
    var progressbar = document.getElementById("progressExample");
    
    if(seeking)
        {
           progressbar.value=event.clientX-progressbar.offsetLeft;
            seekto=audio.duration*(progressbar.value/100)
            audio.currentTime=seekto;
        }
}
function fuck(audio) {
    console.log("df");
    var progressbar = document.getElementById("progressExample");
    console.log(audio.currentTime);
    progressbar.setAttribute("value", Math.round(audio.currentTime));   
    progressbar.value=Math.round(audio.currentTime);
}


function seekNext(prog) {//click for seek time on progress bar
    var audio = document.getElementById("example");

    audio.currentTime=prog.value;
    prog.value=audio.currentTime;


}


function playAudio()
{
    var audio = document.getElementById("example");
    var progressbar = document.getElementById("progressExample");
    progressbar.max = Math.round(audio.duration);
    audio.play();
}



