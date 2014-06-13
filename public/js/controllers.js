'use strict';
/**
 * Created by mindtap on 6/9/14.
 */

var app = angular.module('Collab', []);

app.controller('mainController', function($scope) {
    this.meetingName = $scope.meetingName;
    this.initiatorName = $scope.initiatorName;

    $scope.generateId = function(){
      alert("MeetingName: " + this.meetingName + " " + "InitiatorName : "+ this.initiatorName);
    };

});