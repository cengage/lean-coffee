/**
 * Created by mindtap on 6/9/14.
 */
//register services
angular.module('meetingService', [])
    .factory('Meetings', function ($http) {
        return {
            create : function(meetingData){
                return $http.post('/api/meetings', meetingData);
            }
        }
    });


angular.module('Collabnotes.services', [])
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