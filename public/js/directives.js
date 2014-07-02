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
                socket.emit('moveNote', {
                    _id: scope.note._id,
                    x: ui.position.left,
                    y: ui.position.top
                });
            }
        });

        socket.on('onNoteMoved', function(data) {
            // Update if the same note
            if(data._id == scope.note._id) {
                element.animate({
                    left: data.x,
                    top: data.y
                });
            }
        });

        // Some DOM initiation to make it nice
        element.css('left', '300px');
        element.css('top', '100px');
        element.hide().fadeIn();
    };

    var controller = function($scope) {
        // Incoming
        socket.on('onNoteUpdated', function(data) {
            // Update if the same note
            if(data._id == $scope.note._id) {
                $scope.note.title = data.title;
                $scope.note.content = data.content;
                $scope.note.counter = data.votes;
                $scope.note.assignedTo = data.assignedTo;
            }
        });

        // Outgoing
        $scope.updateNote = function(note) {
            socket.emit('updateNote', note);
        };

        $scope.deleteNote = function(_id) {
            $scope.ondelete({
                _id: _id
            });
        };
    };

    return {
        restrict: 'A',
        link: linker,
        controller: controller,
        scope: {
            note: '=',
            ondelete: '&'
        }
    };
})

    .directive('stickyNoteCreate', function() {
        var linker = function(scope, element) {
            element.draggable({
                snap: ".row,.sticky-note"
                });

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


    .directive('chatList', function(socket) {



    });
