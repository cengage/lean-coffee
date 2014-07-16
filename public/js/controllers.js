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
            $scope.meeting.topics = [];
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
        $scope.handleDeletedNoted(data._id);
    });

    socket.on('onVoteUp', function(data){
        angular.forEach($scope.meeting.topics, function(note) {
            if(note._id == data._id){
//                note.title = data.title;
//                note.content = data.content;
                note.votes = data.votes;
//                note.assignedTo = data.assignedTo;
            }
        });
    });

    socket.on('onStatusChange', function(data){
        angular.forEach($scope.meeting.topics, function(note) {
            if(note._id == data._id){
                note.status = data.status;
//                note.title = data.title;
//                note.content = data.content;
                note.votes = data.votes;
//                note.assignedTo = data.assignedTo;
            }
        });
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
//                note.votes = data.votes;
//                note.assignedTo = data.assignedTo;
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
                    currentUser = $scope.meeting.users.slice(-1)[0];
                    $scope.meeting.currentUser = currentUser;
                    socket.emit('userJoin', $scope.meeting.users);
                })
                .error(function(error){
                    alert(error);
                });
            $(".usernameInput").val('');
            $(".userEmail").val('');
            $(".usernameInput").hide( "slow");
            $(".userEmail").hide("slow");
            $("#joinButton").hide( "slow");
            $("#createButton").show("slow");
            $("#leaveButton").show("slow");
            $("#resetButton").show("slow");
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
                $scope.meeting = data;
                $scope.meeting.currentUser = currentUser;
                topic = $scope.meeting.topics.slice(-1)[0];
                //alert(topic._id);
                socket.emit('createNote', topic);
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

    $scope.voteUp = function(note) {
        if(currentUser.votesRemaining <= 0){
            alert("You finished your 5 votes");
            return;
        }
        note.votes += 1;
        $scope.meeting.currentTopic = note;
        $scope.meeting.currentUser = currentUser;
        Meeting.incVoteTopic($scope.meeting)
            .success(function(data){
                socket.emit('voteUp', note);
            });
        --currentUser.votesRemaining;
        Meeting.decVoteUser($scope.meeting)
            .error(function(err){
                ++currentUser.votesRemaining;
            });
    };

    $scope.changeStatus = function(note){
        if(note.status == 'Ready'){
            note.status = 'Doing';
        }else if(note.status == 'Doing'){
            note.status = 'Done';
        }else if(note.status == 'Done'){
            note.status = 'Ready';
            note.votes = 0;
        }
        $scope.meeting.currentTopic = note;
        Meeting.changeTopicStatus($scope.meeting)
            .success(function(data){
                socket.emit('statusChange', note);
            });
    };

    $scope.resetVotes = function(){
        angular.forEach($scope.meeting.topics, function(note) {
            if(note.status == "Ready"){
                note.votes = 0;
            }
        });
        currentUser.votesRemaining = 5;
        angular.forEach($scope.meeting.users, function(user) {
            user.votesRemaining = 5;
        });
        Meeting.resetVotes($scope.meeting)
            .success(function(data){
                socket.emit('resetVotes', {_id:$scope.meeting._id});
            });
    };

    socket.on('onResetVotes', function(data){
        angular.forEach($scope.meeting.topics, function(note) {
            if(note.status == "Ready"){
                note.votes = 0;
            }
        });
        currentUser.votesRemaining = 5;
        angular.forEach($scope.meeting.users, function(user) {
            user.votesRemaining = 5;
        });
    });

});