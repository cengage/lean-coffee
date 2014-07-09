'use strict';
/**
 * Created by mindtap on 6/9/14.
 */
angular.module('meetingController', [])

    .controller('mainController', function($scope, $http, Meeting, $location) {

        $scope.generateId = function(){
            Meeting.create($scope.meeting)
                .success(function(data){
                    alert("A new meeting is created with id: " + data._id
                        + "\n"+"Meeting Name: "+$scope.meeting.meetingName
                        + "\n"+"Initiator Name: "+$scope.meeting.initiatorName);
                    $scope.meeting = {};
                    $location.path('/Meeting/' + data._id);
                })
                .error(function(err){
                    console.log(err);
                });
        };
    });

angular.module('leanNotes.controllers', [])
.controller('Main', function($scope, socket, $routeParams, Meeting, $location) {
    $scope.meeting = {};
    $scope.meeting.topics = [];
    $scope.meeting.users = [];
    var currentUser = {};

    Meeting.getMeeting($routeParams.meetingId)
        .success(function(data){
            $scope.meeting = data;
           // alert("Welcome to meeting with Id : " + $scope.meeting._id);
        })
        .error(function(err){
            $location.path('/Meeting');
           alert("This is not a valid meeting, please check the link")
        });


    // Incoming
    socket.on('onNoteCreated', function(data) {
        $scope.meeting.topics.push(data);
    });

    socket.on('onNoteDeleted', function(data) {
        $scope.handleDeletedNoted(data.title);
    });

    socket.on('onUserJoin',function(data){
        //alert('receive user joining event' );
        //alert(data);
        $scope.meeting.users = data;
        });
    // Outgoing

    socket.on('onNoteUpdated', function(data) {
        angular.forEach($scope.meeting.topics, function(note) {
            if(note._id == data._id){
                note.title = data.title;
                note.content = data.content;
                note.counter = data.votes;
                note.assignedTo = data.assignedTo;
            }
        });
    });


    $scope.updateNote = function(note) {
        socket.emit('updateNote', note);
    };

    $scope.userJoin = function(){

        if($scope.meeting._id == null){
            alert("Meeting is not validated yet");
        }else if($(".usernameInput").val()==""){
            alert("Enter your name first");
        }else{
            currentUser = {
                email: $(".userEmail").val(),
                name : $(".usernameInput").val(),
                votesRemaining : 5
            };

            for(var i = 0; i < $scope.meeting.users.length; i++)
            {
                if($scope.meeting.users[i].email == currentUser.email)
                {
                    alert("User with Email Id already exists");
                    return;
                }
            }

            $scope.meeting.currentUser = currentUser;

            Meeting.updateUsers($scope.meeting)
                .success(function (data) {
                    $scope.meeting = data;
                    $scope.meeting.currentUser = currentUser;
                    socket.emit('userJoin', $scope.meeting.users);
                })
                .error(function(error){
                    alert(error);
                })
            $(".usernameInput").val('');
            $(".userEmail").val('');
            $(".usernameInput").hide( "slow");
            $(".userEmail").hide("slow");
            $("#joinButton").hide( "slow");
            $("#createButton").show("slow");
            $("#leaveButton").show("slow");
        }

    };
    $scope.createNote = function() {
        if($scope.meeting.currentUser == null){
            alert('Please enter Username before creating a topic');
        }else {
            $('#noteInitial').show();
        }
    };

    $scope.saveNote = function() {

        var topic = {
            title: $("#title").val(),
            content: $("#content").val(),
            status: 'Ready',
            assignedTo: $scope.meeting.currentUser.name,
            votes:0
        };
        $scope.meeting.currentTopic = topic;
        Meeting.updateNotes($scope.meeting)
            .success(function(data){
                alert(data._id);
                $scope.meeting = data;
                $scope.meeting.currentUser = currentUser;
                socket.emit('createNote', $scope.meeting.topics.slice(-1));
            });
        $('#noteInitial').hide();
        $("#title").val("");
        $("#content").val("");
    };

    $scope.discardNote = function() {
        $('#noteInitial').hide();
        $("#title").val("");
        $("#content").val("");
    };

    $scope.deleteNote = function(_id) {
        $scope.handleDeletedNoted(_id);
        socket.emit('deleteNote', {_id: _id});
    };

    $scope.handleDeletedNoted = function(_id) {
        var oldNotes = $scope.meeting.topics,
            newNotes = [];

        angular.forEach(oldNotes, function(note) {
            if(note._id !== _id) newNotes.push(note);
        });
        $scope.meeting.topics = newNotes;
    };

})

.controller('myController',function($scope,$timeout,socket)
 {
    $scope.timercounter = 10;
    var mytimeout = 0;

    socket.on('onplay',function(){
        $scope.play();
    });
    socket.on('onpause',function(){
        $scope.pause();
    });
    socket.on('onstop',function(){
        $scope.stop();
    });

    $scope.play = function(){
        $scope.onTimeout = function(){
            if($scope.timercounter!=0)
            {
                $scope.timercounter--;
                mytimeout = $timeout($scope.onTimeout,1000);
            }
            else
            {
                $timeout.cancel(mytimeout);
            }
        }
        mytimeout = $timeout($scope.onTimeout,1000);
        socket.emit('play');
    }
    $scope.pause = function(){
        $timeout.cancel(mytimeout);
        socket.emit('pause');
    }
    $scope.stop = function(){
        $scope.timercounter = 10;
        socket.emit('stop');
    }
});