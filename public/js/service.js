'use strict';
/**
 * Created by mindtap on 6/9/14.
 */


angular.module('meetingService', [])
    .factory('Meetings', function ($http) {
        try{
        console.log("Meeting service");
        return {
            create : function(meetingData){
                console.log('well, here we go');
                return $http.post('/api/meetings', meetingData);
                }

        }
        }
        catch(err)
        {console.log(err.message);}
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
