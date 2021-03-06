'use strict';
/**
 * Created by mindtap on 6/9/14.
 */


angular.module('meetingService', [])
    .factory('Meeting', function ($http) {
        try{
            return {
                create : function(meetingData) {
                    return $http.post('/api/meetings', meetingData);
                },
                getMeeting: function(meetingId) {
                    return $http.get('/api/meeting/'+ meetingId);
                },
                getMeetingsList: function() {
                    return $http.get('/api/meetings/');
                },
                updateUsers : function(meeting) {
                    return $http.put('/api/user', meeting);
                },
                updateNotes : function(meeting) {
                    return $http.put('/api/topic', meeting);
                },
                incVoteTopic : function(meeting) {
                    return $http.put('/api/topic/vote', meeting);
                },
                deleteTopic: function(meeting) {
                    return $http.put('/api/topic/remove', meeting);
                },
                changeTopicStatus : function(meeting){
                    return $http.put('/api/topic/changeStatus', meeting);
                },
                decVoteUser : function(meeting){
                    return $http.put('/api/user/decVote', meeting);
                },
                resetVotes : function(meeting){
                    return $http.put('/api/resetVotes', meeting);
                },
                saveConfig : function(meeting){
                    return $http.put('/api/config', meeting);
                },
                changeTopic : function(meeting){
                    return $http.put('/api/topic/changeText', meeting);
                },
                updateChats : function(meeting){
                    return $http.put('/api/chat', meeting);
                }
            }
        }
        catch(err){
            console.log(err.message);
        }
    }).factory('timerData', function(){
    var data =
    {
        timerCounter: '', myVoteCounter:'', extendedTimerCounter:''
    };

    return {
        getMyVoteCounter: function () {
            return data.myVoteCounter;
        },
        setMyVoteCounter: function (VoteCounter) {
            data.myVoteCounter = VoteCounter;
        },
        getTimerCounter: function () {
            return data.timerCounter;
        },
        setTimerCounter: function (timercount) {
            data.timerCounter = timercount;
        },
        getExtendedTimerCounter: function () {
            return data.extendedTimerCounter;
        },
        setExtendedTimerCounter: function (extendedTimerCount) {
            data.extendedTimerCounter = extendedTimerCount;
        }

    };
});

angular.module('leanNotes.services', [])
.factory('socket', function($rootScope) {
    var socket = io.connect();
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});
