'use strict';
// Declare app level module which depends on filters, and services
angular.module('leanNotes', [
    'leanNotes.services',
    'leanNotes.directives',
    'leanNotes.controllers','meetingController',
    'meetingService','timerController'
])

.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){

        $routeProvider

        .when('/Meeting/:meetingId',{
            templateUrl:'/public/partials/Meeting.html',
            controller:'Main'
        })
        .when('/meetings_list',{
            templateUrl:'/public/partials/meetings_list.html',
            controller:'meetings_list'
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




