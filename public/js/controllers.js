'use strict';
/**
 * Created by mindtap on 6/9/14.
 */
angular.module('meetingController', [])

    .controller('mainController', function($scope, $http, Meeting, $location) {

        $scope.generateId = function(){
            //Default config values
            $scope.meeting.timePerTopic = 5;
            $scope.meeting.extraTimePerTopic = 2;
            $scope.meeting.votesPerUser = 3;
            Meeting.create($scope.meeting)
                .success(function(data){
                    $scope.meeting = {};
                    $location.path('/Meeting/' + data._id);
                })
                .error(function(err){
                    console.log(err);
                });
        };
    });

angular.module('leanNotes.controllers', [])
    .controller('Main', function($scope, socket, $routeParams, Meeting, $location,timerData) {
        $scope.meeting = {};
        $scope.meeting.topics = [];
        $scope.meeting.users = [];
        $scope.meeting.chats = [];
        $scope.voteThisNote =0;
        var currentUser = {};
        $scope.fieldToSortOn = '-_id';

        //a $watch to watch for any changes to meeting.configurations.timePerTopic and share it across the variables
        $scope.$watch('meeting.configurations.timePerTopic', function (newValue) {
            if (newValue) timerData.setTimerCounter(newValue);
        });

        $scope.$watch('voteThisNote', function (newValue) {
            if (newValue) timerData.setMyVoteCounter(newValue);
        });

        $scope.$watch(function () { return timerData.getMyVoteCounter(); }, function (newValue) {
            if (newValue==0) {
                $scope.voteThisNote=0;
            };
        });
        Meeting.getMeeting($routeParams.meetingId)
            .success(function(data){
                $scope.meeting = data;
                if(sessionStorage.meetingId == $scope.meeting._id){
                    for(var i = 0; i < $scope.meeting.users.length; i++)                    {
                        if($scope.meeting.users[i]._id == sessionStorage.userId){
                            currentUser = $scope.meeting.users[i];
                            $scope.meeting.currentUser = currentUser;
                            $("#usernme").val('');
                            $("#usernameEmail").val('');
                            $("#usernme").hide();
                            $("#usernameEmail").hide();
                            $("#joinButton").hide();
                            $("#createButton").show("slow");
                            $("#leaveButton").show("slow");
                            $("#resetButton").show("slow");
                        }
                    }
                }
                if(!currentUser._id)
                    $scope.meeting.topics = [];
            })
            .error(function(err){
                $location.path('/Meeting');
                alert("This is not a valid meeting, please check the link")
            });

        socket.on('connect', function (data) {
            socket.emit('joinMeeting', $routeParams.meetingId );
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

        socket.on('onVoteUpThisNote',function(data){
            $scope.handleVoteUpThisNote(data);
        });
        socket.on('onVoteDownThisNote',function(data){
            $scope.handleVoteDownThisNote(data);
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
            $scope.meeting.currentTopic = note;
            Meeting.changeTopic($scope.meeting)
                .success(function(data){
                    socket.emit('updateNote', note);
                });
        };

        $scope.userJoin = function(){
            if($scope.meeting._id == null){
                alert("Meeting is not validated yet");
            }else if($(".usernameInput").val()=="" && $(".userEmail").val()==""){
                alert("Enter your name and email");
            }else{
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
                        sessionStorage.meetingId = $scope.meeting._id;
                        sessionStorage.userId = currentUser._id;
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
        };

        $scope.createNote = function() {
            if($scope.meeting.currentUser == null){
                alert('Please enter Username before creating a topic');
            }else {
                $('#noteInitial').show();
                $('#title').focus();
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

        $scope.ResetVoteThisNote = function(voteThisNote){
            $scope.voteThisNote =0;
            socket.emit('ResetVoteThisNote', $scope.voteThisNote);
        }
        $scope.handleResetVoteThisNote=function(data){
            $scope.voteThisNote = data;
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
        $scope.voteUpThisNote = function(voteThisNote){
            $scope.voteThisNote +=1;
            socket.emit('voteUpThisNote', $scope.voteThisNote);
        }
        $scope.handleVoteUpThisNote=function(data){
            $scope.voteThisNote = data;
        }
        $scope.voteDownThisNote = function(voteThisNote){
            $scope.voteThisNote -=1;
            socket.emit('voteDownThisNote', $scope.voteThisNote);
        }

        $scope.handleVoteDownThisNote=function(data){
            $scope.voteThisNote = data;
        }
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
                    $("#setting-sidebar-wrapper").toggleClass("active");
                    $scope.timercounter = $scope.meeting.configurations.timePerTopic * 60;
                    socket.emit('saveConfig', $scope.meeting.configurations);
                });
        };

        socket.on('onSaveConfig', function(data){
            $scope.meeting.configurations = data;
        });

        $scope.userLeave = function () {
            $scope.meeting.topics = [];
            currentUser = {};
            sessionStorage.meetingId = null;
            sessionStorage.userId = null;
            $("#usernme").val('');
            $("#usernameEmail").val('');
            $("#usernme").show("slow");
            $("#usernameEmail").show("slow");
            $("#joinButton").show("slow");
            $("#createButton").hide("slow");
            $("#leaveButton").hide("slow");
            $("#resetButton").hide("slow");
        };

        $scope.sendChat = function(){
            $scope.meeting.currentChat = {name: $scope.meeting.currentUser.name, message: $scope.chatInput};
            $scope.meeting.chats.push($scope.meeting.currentChat)
            Meeting.updateChats($scope.meeting)
                .success(function(data){
                    socket.emit('createChat', $scope.meeting.currentChat);
                    $scope.chatInput = ""; $scope.meeting.currentChat = {};
                });

        };

        socket.on('onCreateChat', function(data){
            $scope.meeting.chats.push(data);
        });

        $scope.sortOnVotes = function(){
            if($scope.fieldToSortOn == 'votes'){
                $scope.fieldToSortOn = '-_id';
            }
            else{
                $scope.fieldToSortOn = 'votes';
            }
        };

    });