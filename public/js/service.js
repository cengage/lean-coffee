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
                }
            }
        }
        catch(err){
            console.log(err.message);
        }
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
