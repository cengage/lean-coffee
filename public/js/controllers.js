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
    $scope.notes = [];

    $scope.meeting = {};
    $scope.meeting.users = [];

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
        $scope.notes.push(data);
    });

    socket.on('onNoteDeleted', function(data) {
        $scope.handleDeletedNoted(data.id);
    });

    socket.on('onUserJoin',function(data){
        //alert('receive user joining event' );
        //alert(data);
        $scope.meeting.users = data;
        });
    // Outgoing

    $scope.userJoin = function(){

        if($scope.meeting._id == null){
            alert("Meeting is not validated yet");
        }

        var user = {
            name : $(".usernameInput").val(),
            votesRemaining : 5
        };

        $scope.meeting.users.push(user);
        $scope.meeting.currentUser = user;

        Meeting.updateUsers($scope.meeting)
            .success(function (data) {
                //alert("Hi " + user.name + "!!!");
                socket.emit('userJoin', $scope.meeting.users);
            });
        $(".usernameInput").val('');
        $(".usernameInput").hide( "slow");
        $("#joinButton").hide( "slow");
    };
    $scope.createNote = function() {
        //alert('about to prep object note for push into notes');
        if($scope.meeting.currentUser == null){
            alert('Please enter Username before creating a topic');
        }else {
            $('#noteInitial').show();
        }
    };

    $scope.saveNote = function() {
        $scope.meeting.currentTopic = {
            _id: new Date().getTime(),
            title: $("#title").val(),
            content: $("#content").val(),
            status: 'Ready',
            assignedTo: $scope.meeting.currentUser,
            votes:0
        };
        $scope.notes.push($scope.meeting.currentTopic);
        socket.emit('createNote', $scope.meeting.currentTopic);
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
        var oldNotes = $scope.notes,
            newNotes = [];

        angular.forEach(oldNotes, function(note) {
            if(note._id !== _id) newNotes.push(note);
        });
        $scope.notes = newNotes;
    }
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
