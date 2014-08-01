angular.module('timerController', [])
    .controller('myController',function($scope,$timeout,socket,$routeParams,Meeting,timerData)
    {
        var timeCard=0; var extendedTime =0; var votes = 0;

        $scope.$watch(function () { return timerData.getTimerCounter(); }, function (newValue) {
            if (newValue) {timeCard = newValue;
                $scope.timestuff="";
                $scope.timercounter = parseFloat( timeCard) * 60; // at the place of the number one; we should place the user entered value for time/card
                $scope.MinTimeLimit= 60; // at the place of the number 0.5; we should place the user entered value for warning for time left
                var hours = parseInt( $scope.timercounter / 3600 ) % 24;
                var minutes = parseInt( $scope.timercounter / 60 ) % 60;
                var seconds = $scope.timercounter % 60;
                $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);

            }
        });

        $scope.$watch(function () { return timerData.getMyVoteCounter(); }, function (newValue) {
            // console.log("The Value is " + newValue);
            setInterval(function(){
                if (timerData.getMyVoteCounter() >0 && $scope.timercounter==0) {
                    timerData.setMyVoteCounter(0);
                    //$scope.voteThisNote = 0;
                    //console.log("$scope.voteThisNote : "+$scope.voteThisNote);
                    //console.log($scope);

                    Meeting.getMeeting($routeParams.meetingId)
                        .success(function (data) {
                            timeCard = data.configurations.timePerTopic;
                            extendedTime = data.configurations.extraTimePerTopic;
                            votes = data.configurations.votesPerUser;
                            $scope.timestuff = "";
                            $scope.timercounter = parseFloat(extendedTime) * 60; // at the place of the number one; we should place the user entered value for time/card
                            $scope.MinTimeLimit = 60; // at the place of the number 0.5; we should place the user entered value for warning for time left
                            var hours = parseInt($scope.timercounter / 3600) % 24;
                            var minutes = parseInt($scope.timercounter / 60) % 60;
                            var seconds = $scope.timercounter % 60;
                            $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds);
                            timerData.setMyVoteCounter(0);

                        })
                        .error(function (err) {$location.path('/Meeting');
                            alert("This is not a valid meeting, please check the link")
                        });
                }
            },1000);

        });

        Meeting.getMeeting($routeParams.meetingId)
            .success(function(data){
                timeCard = data.configurations.timePerTopic;
                extendedTime= data.configurations.extraTimePerTopic;
                votes = data.configurations.votesPerUser;
                $scope.timestuff="";
                $scope.timercounter = parseFloat( timeCard) * 60; // at the place of the number one; we should place the user entered value for time/card
                $scope.MinTimeLimit= 60; // at the place of the number 0.5; we should place the user entered value for warning for time left
                var hours = parseInt( $scope.timercounter / 3600 ) % 24;
                var minutes = parseInt( $scope.timercounter / 60 ) % 60;
                var seconds = $scope.timercounter % 60;
                $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);

            })
            .error(function(err){
                $location.path('/Meeting');
                alert("This is not a valid meeting, please check the link")
            });
        var mytimeout = 0;

        socket.on('onSyncTime',function(data){
            $scope.handleSyncTime(data);
        });
        socket.on('onplay',function(){
            $scope.handlePlay();
        });
        socket.on('onpause',function(){
            $scope.handlePause();
        });
        socket.on('onstop',function(){
            $scope.handleStop();
        });

        $scope.handleSyncTime= function(data){
            //console.log("#YOLO");
            if(socket.id!=data.myId)
                $scope.timercounter  = data.timerData;
        }

        $scope.play = function(){
            $scope.handlePlay();
            console.log("I am played and I have emitted");
            socket.emit('play');
        }

        $scope.handlePlay = function(){
            $scope.onTimeout = function(){
//                if((($scope.timercounter%5)==0)&& $scope.timercounter!=0)
                if($scope.timercounter!=0)
                {
                    //$scope.handleSyncTime($scope.timercounter);
                    //console.log("I should be seen every 5 seconds " + $scope.timercounter);
                    var tempdata ={
                        myId : socket.id, timerData:$scope.timercounter
                    };
                    socket.emit('SyncTime',tempdata);
                }
                if($scope.timercounter <= $scope.MinTimeLimit && $scope.timercounter!=0)
                {
                    $(".myTimerDisplay").css("color","red").fadeOut("slow");
                    $(".myTimerDisplay").css("color","red").fadeIn("slow");
                }
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
            $scope.timercounter = timeCard*60;
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