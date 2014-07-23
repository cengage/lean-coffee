'use strict';
/**
 * Created by mindtap on 6/9/14.
 */

angular.module('leanNotes.directives', [])
.directive('stickyNote', function(socket) {
    var linker = function(scope, element, attrs) {
        element.draggable({
            snap: ".row,.sticky-note",
            stop: function(event, ui) {

            }
        });
        // Some DOM initiation to make it nice
        element.hide().fadeIn();
    };

    return {
        restrict: 'A'
//       link: linker
    };
})

    .directive('stickyNoteCreate', function() {
        var linker = function(scope, element) {
//            element.draggable({
//                //snap: ".row,.sticky-note"
//                });

            // Some DOM initiation to make it nice
            element.css('left', '50px');
            element.css('top', '20px');
            element.hide().fadeIn();
            element.css("background-color", '#99CCFF')
        };

        return {
            restrict: 'A',
            link: linker
        };
    })

    .directive('ngBlur', function() {
        return function( scope, elem, attrs ) {
            elem.bind('blur', function() {
                scope.$apply(attrs.ngBlur);
            });
        };
    })

    .directive('chatList', function(socket) {



    });