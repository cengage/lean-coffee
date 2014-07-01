'use strict';
// Declare app level module which depends on filters, and services
angular.module('leanNotes', [
    'leanNotes.services',
    'leanNotes.directives',
    'leanNotes.controllers','meetingController',
    'meetingService'
])

.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
        //$locationProvider.html5Mode(true);
        $routeProvider

        .when('/Meeting/:meetingId',{
            templateUrl:'/public/partials/Meeting.html',
            controller:'Main'
        })
        .when('/',{
            templateUrl:'/public/partials/createMeet.html',
            controller:'mainController'
        })
        .otherwise({
                templateUrl:'/public/partials/error.html',
                controller:'Error'
        });

}]);




