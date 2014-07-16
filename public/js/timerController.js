angular.module('timerController', [])
    .controller('myController',function($scope,$timeout,socket)
    {
        $scope.timestuff="";
        $scope.timercounter = 1 * 60; // at the place of the number one; we should place the user entered value for time/card
        $scope.MinTimeLimit= 0.5 * 60; // at the place of the number 0.5; we should place the user entered value for warning for time left

        var hours = parseInt( $scope.timercounter / 3600 ) % 24;
        var minutes = parseInt( $scope.timercounter / 60 ) % 60;
        var seconds = $scope.timercounter % 60;
        $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);

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
                if($scope.timercounter <= $scope.MinTimeLimit && $scope.timercounter!=0)
                {
                    //$(".myTimerDisplay").css("color","red").fadeIn("slow");
                    $(".myTimerDisplay").css("color","red").fadeOut("slow");
                    $(".myTimerDisplay").css("color","red").fadeIn("slow");
                }
//                else
//                {
//                    $(".myTimerDisplay").css("color","black");
//                }
                if($scope.timercounter!=0)
                {
                    $scope.timercounter--;
                    var hours = parseInt( $scope.timercounter / 3600 ) % 24;
                    var minutes = parseInt( $scope.timercounter / 60 ) % 60;
                    var seconds = $scope.timercounter % 60;
                    $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);
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
            var hours = parseInt( $scope.timercounter / 3600 ) % 24;
            var minutes = parseInt( $scope.timercounter / 60 ) % 60;
            var seconds = $scope.timercounter % 60;
            $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);

            $("#startBtn").show("slow");
            $("#stopBtn").hide("slow");
            $("#pauseBtn").show("slow");
            $(".myTimerDisplay").css("color","black");
        }
    });