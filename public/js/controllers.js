'use strict';
/**
 * Created by mindtap on 6/9/14.
 */
angular.module('meetingController', [])

    .controller('mainController', function($scope, $http, Meetings, $location) {

        $scope.generateId = function(){
            Meetings.create($scope.meeting)
                .success(function(data){
                    alert("A new meeting is created with id: " + data._id
                        + "\n"+"Meeting Name: "+$scope.meeting.meetingName
                        + "\n"+"Initiator Name: "+$scope.meeting.initiatorName);
                    $scope.meeting = {};
                    $location.path('/Meeting');
                })
                .error(function(err){
                    console.log(err);
                });
        };

    });
angular.module('leanNotes.controllers', [])
.controller('Main', function($scope, socket) {
    $scope.notes = [];
    $scope.users =[];
    var $usernameInput = $('.usernameInput'); // Input for username
    var username;

    // Incoming
    socket.on('onNoteCreated', function(data) {
        $scope.notes.push(data);
    });

    socket.on('onNoteDeleted', function(data) {
        $scope.handleDeletedNoted(data.id);
    });

    socket.on('onUserJoin',function(data){
        alert('receive user joining event' );
        alert(data);
        $scope.users=data;
        });
    // Outgoing

    $scope.userJoin = function(){
       // alert('about to prep object user for push into users');
        var user ={
            id:new Date().getTime(),
            username: $('.usernameInput').val().trim()
        };
        //alert('I should push user into the array');
        //alert($usernameInput);
        $scope.users.push(user);
        //alert('Yo I am emitting user joining event');
        socket.emit('userJoin', $scope.users);
    };
    $scope.createNote = function() {
        //alert('about to prep object note for push into notes');
        var note = {
            id: new Date().getTime(),
            title: 'Note Title',
            body: 'Note Content',
            counter:0
        };
        //alert('I should push note into the array');
        $scope.notes.push(note);
        //alert('Yo I am emitting note creating event');
        socket.emit('createNote', note);
    };

    $scope.deleteNote = function(id) {
        $scope.handleDeletedNoted(id);

        socket.emit('deleteNote', {id: id});
    };
    $scope.handleDeletedNoted = function(id) {
        var oldNotes = $scope.notes,
            newNotes = [];

        angular.forEach(oldNotes, function(note) {
            if(note.id !== id) newNotes.push(note);
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
})

.controller('lifeCtrl',function($scope,$routeParams){
    $scope.name='lifeCtrl';
    $scope.params=$routeParams;
});
