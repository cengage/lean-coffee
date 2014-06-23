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
