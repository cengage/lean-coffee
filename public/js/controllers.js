/**
 * Created by mindtap on 6/9/14.
 */

angular.module('meetingController', [])

    .controller('mainController', function($scope, $http, Meetings) {

        $scope.generateId = function(){
             Meetings.create($scope.meeting)
                .success(function(data){
                    alert("A new meeting is created with id: " + data._id
                        + "\n"+"Meeting Name: "+$scope.meeting.meetingName
                        + "\n"+"Initiator Name: "+$scope.meeting.initiatorName);
                     $scope.meeting = {};
            });
        };

    });