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
            if (sessionStorage.CurrUser != undefined ||  sessionStorage.CurrUser != null) {

                console.log(sessionStorage.CurrUser);
                currentUser.name = sessionStorage.CurrUser;
                currentUser.email = sessionStorage.email;
                currentUser.votesRemaining = $scope.meeting.configurations.votesPerUser;
                $scope.meeting.currentUser = currentUser;
                Meeting.getMeeting($scope.meeting._id)
                    .success(function (data) {
                        $scope.meeting = data;
                        currentUser = $scope.meeting.users.slice(-1)[0];
                        $scope.meeting.currentUser = currentUser;
                        //console.log("joining yo!!!");
                        //alert("joining yo!!!");
                        socket.emit('userJoin', $scope.meeting.users);
                    })
                    .error(function (error) {
                        alert(error);
                    });
                $("#usernme").val('');
                $("#usernameEmail").val('');
                $("#usernme").hide();
                $("#usernameEmail").hide();
                $("#joinButton").hide();
                $("#createButton").show("slow");
                $("#leaveButton").show("slow");
                $("#resetButton").show("slow");

            }


        })
        .error(function(err){
            $location.path('/Meeting');
            alert("This is not a valid meeting, please check the link")
        });


    // Incoming
    socket.on('onNoteCreated', function(data) {
        if(currentUser.email){
            $scope.meeting.topics.push(data);
        }
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
        $scope.meeting.users = data;
    });

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
        if (sessionStorage.CurrUser == 'undefined' ||  sessionStorage.CurrUser == null) {
        if($scope.meeting._id == null){
            alert("Meeting is not validated yet");
        }else if($(".usernameInput").val()=="" && $(".userEmail").val()==""){
            alert("Enter your name and email");
        }else{
            sessionStorage.CurrUser = $(".usernameInput").val();
            sessionStorage.email = $(".userEmail").val();
            currentUser = {
                email: $(".userEmail").val(),
                name : $(".usernameInput").val(),
                votesRemaining : $scope.meeting.configurations.votesPerUser
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
            $("#usernme").val('');
            $("#usernameEmail").val('');
            $("#usernme").hide("slow");
            $("#usernameEmail").hide("slow");
            $("#joinButton").hide("slow");
            $("#createButton").show("slow");
            $("#leaveButton").show("slow");
            $("#resetButton").show("slow");
        }
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
            if(note._id !== _id)
                newNotes.push(note);
            else
                $scope.meeting.currentTopic = note;
        });
        $scope.meeting.topics = newNotes;
        Meeting.deleteTopic($scope.meeting)
            .success(function(data){

            });
    };

    $scope.voteUp = function(note) {
        if(currentUser.votesRemaining <= 0){
            alert("You finished all your votes");
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
        currentUser.votesRemaining = $scope.meeting.configurations.votesPerUser;
        angular.forEach($scope.meeting.users, function(user) {
            user.votesRemaining = $scope.meeting.configurations.votesPerUser;
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
        currentUser.votesRemaining = $scope.meeting.configurations.votesPerUser;
        angular.forEach($scope.meeting.users, function(user) {
            user.votesRemaining = $scope.meeting.configurations.votesPerUser;
        });
    });

    $scope.saveConfig = function(){
        Meeting.saveConfig($scope.meeting)
            .success(function(data){
                socket.emit('saveConfig', $scope.meeting.configurations);
            });
    };

    socket.on('onSaveConfig', function(data){
        $scope.meeting.configurations = data;
    });

});