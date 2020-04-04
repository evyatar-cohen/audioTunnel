var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "courses.htm"
          
        })
        .when("/lesson", {
            templateUrl: "lesson.htm",
            controller: "lessonCtrl"

        })
        .when("/courses", {
            templateUrl: "courses.htm"
           

        })
        .when("/course", {
            templateUrl: "course.htm",
            controller: "courseCtrl"
        });
});

var courseLogo = "";
var lessonTitle = "";
var authorName = "";
var audioDuration;
var audioSrc = "";


//var tempCourse = ["milk", "bread"];
//var app2 = angular.module("coursePage", []); 
//app.controller("coursesCtrl", function ($scope) {
//    console.log("hi");
//    $scope.crss = tempCourse;
//});

//var coursesArray = [];
//var arr = ["milk", "bread"];


//app.controller("coursesCtrl", function ($scope) {
//    loadDoc()//load xml file
//    console.log("zekan");

//});

app.controller("lessonCtrl", function ($scope) {
    $scope.lessonTitle = lessonTitle;
});

app.controller("courseCtrl", function ($scope) {
    $scope.courseTitle = tempCourse;
});


function loadDoc() {
    console.log("zepo");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var xmlDoc = this.responseXML;

            lessonTitle = courses[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        };
        xhttp.open("GET", "myTrees/myTree.xml", true);
        xhttp.send();

    }

    //function courseList() {
    //    var xmlDoc = xml1.responeXML;
    //    var courses = xmlDoc.getElementByTagName("course");
    //    console.log(courses);


    //}
    //var courseId = "1";
    //var tempCourse;

    //function coursesList(xml){
    //    var xmlDoc = xml.responseXML;
    //    var courses = xmlDoc.getElementsByTagName("course");
    //    var coursesList = document.getElementById("coursesList");

    //    for (var i = 0; i < courses.length; i++) {
    //        console.log("df");
    //        //var courseLi = document.createElement("a");
    //        //courseLi.href = "#!course";
    //        //courseLi.id = "a" + i.toString();
    //        //courseLi.addEventListener('click', function courseData(event) {
    //        //    tempCourse = courseLi.id;
    //        //    console.log(tempCourse);
    //        //    //LessonsList(event.currentTarget.id, courses);
    //        //}, false);
    //        //var liNode = document.createElement("LI");
    //        var courseTitle = courses[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    //        console.log(courseTitle);
    //        coursesArray[i] = courseTitle;
    //        console.log(coursesArray);

    //        //var txtNode = document.createTextNode(courseTitle);
    //        //courseLi.appendChild(txtNode);
    //        //liNode.appendChild(courseLi);
    //        //coursesList.appendChild(liNode);
    //    }

    //}

    //function LessonsList(e, courseNode) {

    //    var courseLinkId = e.toString();
    //    var courseLinkNum = courseLinkId.substring(1);
    //    var courseNumver = parseInt(courseLinkNum);
    //    console.log(e);
    //    console.log(courseNumver);
    //    console.log(courseNode);
    //    var lessonarray = courseNode[courseNumver-1].getElementsByTagName("lesson");
    //    console.log(lessonarray);

    //    var listNode = document.getElementById("lessonsList");
    //    for (var i = 1; i <= lessonarray.length; i++) {
    //        var courseBtn = document.createElement("a");
    //        courseBtn.href = "#!lesson";
    //        courseBtn.addEventListener('click', function lessonData(event) {
    //            lessonData(event.currentTarget.id, lessons);
    //        }, false);
    //        courseBtn.id = "a" + i.toString();
    //        var liNode = document.createElement("LI");
    //        var lessonTitle = lessonarray[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    //        var txtNode = document.createTextNode(lessonTitle);
    //        courseBtn.appendChild(txtNode);
    //        liNode.appendChild(courseBtn);
    //        listNode.appendChild(liNode);

    //    }

    //}

    //lessonData
    function lessonData(e, lessonNode, courseNode) {

        var s1 = e.toString();
        var s2 = s1.substring(1);
        var lessonNumber = parseInt(s2);

        //courseLogo=
        lessonTitle = lessonNode[lessonNumber].getElementsByTagName("title")[0].childNodes[0].nodeValue;




    }

}