angular.module('timerController', [])
    .controller('myController',function($scope,$timeout,socket)
    {
        $scope.timercounter = 10;
        var mytimeout = 0;

        socket.on('onplay',function(){
            $scope.handlePlay();
        });
        socket.on('onpause',function(){
            $scope.handlePause();
        });
        socket.on('onstop',function(){
            $scope.handleStop();
        });

        $scope.play = function(){
            $scope.handlePlay();
                console.log("I am played and I have emitted");
            socket.emit('play');
        }

        $scope.handlePlay = function(){
            $scope.onTimeout = function(){
                if($scope.timercounter!=0)
                {
                    $scope.timercounter--;
                    mytimeout = $timeout($scope.onTimeout,1000);
                }
                else
                {
                    $timeout.cancel(mytimeout);
                }
            }
            mytimeout = $timeout($scope.onTimeout,1000);
            $("#startBtn").hide("slow");
            $("#pauseBtn").show("slow");
            $("#stopBtn").show("slow");

        }
        $scope.pause = function(){
            $scope.handlePause();
            console.log("I have paused and I have emitted");
            socket.emit('pause');
        }
        $scope.handlePause = function(){
            $timeout.cancel(mytimeout);
            $("#startBtn").show("slow");
            $("#pauseBtn").hide("slow");
            $("#stopBtn").show("slow");
        }
        $scope.stop = function(){

            $scope.handleStop();
            console.log("I have stopped and I have emitted");
            socket.emit('stop');
        }
        $scope.handleStop = function(){
            $timeout.cancel(mytimeout);
            $scope.timercounter = 10;
            $("#startBtn").show("slow");
            $("#stopBtn").hide("slow");
            $("#pauseBtn").show("slow");
        }
    });