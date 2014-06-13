'use strict';
/**
 * Created by mindtap on 6/9/14.
 */

var app = angular.module('Collabnotes', []);

app.controller('mainController', function($scope) {
    this.meetingName = $scope.meetingName;

    $scope.generateId = function(){
      alert(this.meetingName);
    };

});