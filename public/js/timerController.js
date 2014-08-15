angular.module('timerController', [])
    .controller('myController',function($scope,$timeout,socket,$routeParams,Meeting,timerData)
    {
        var timeCard=0; var extendedTime =0; var votes = 0;
        var time_counter = 0;
        var myTime = 0;
        var timer_id=0;
        $scope.$watch(function () { return timerData.getTimerCounter(); }, function (newValue) {
            if (newValue) {time_counter = newValue;
                $scope.timestuff="";
                $scope.timercounter = parseFloat(time_counter) * 60; // at the place of the number one; we should place the user entered value for time/card
                $scope.MinTimeLimit= 60; // at the place of the number 0.5; we should place the user entered value for warning for time left
                var hours = parseInt( $scope.timercounter / 3600 ) % 24;
                var minutes = parseInt( $scope.timercounter / 60 ) % 60;
                var seconds = $scope.timercounter % 60;
                $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);
                myTime = $scope.timercounter;
                if(myTime==0)
                socket.emit('NewTimerCounter',(parseFloat(time_counter) * 60));
            }
        });
        $scope.$watch(function () { return timerData.getExtendedTimerCounter(); }, function (newValue) {
            if (newValue) {$scope.MinTimeLimit = parseFloat(newValue) * 60;;
            }

        });
        $scope.$watch(function () { return timerData.getMyVoteCounter(); }, function (newValue) {
            // console.log("The Value is " + newValue);
            setInterval(function(){
                if (timerData.getMyVoteCounter() >0 && $scope.timercounter==0) {
                    timerData.setMyVoteCounter(0);
                    Meeting.getMeeting($routeParams.meetingId)
                        .success(function (data) {
                            timeCard = data.configurations.timePerTopic;
                            extendedTime = data.configurations.extraTimePerTopic;
                            votes = data.configurations.votesPerUser;
                            $scope.timestuff = "";
                            $scope.timercounter = parseFloat(extendedTime) * 60; // at the place of the number one; we should place the user entered value for time/card
                            $scope.MinTimeLimit = parseFloat(extendedTime) * 60; // at the place of the number 0.5; we should place the user entered value for warning for time left
                            var hours = parseInt($scope.timercounter / 3600) % 24;
                            var minutes = parseInt($scope.timercounter / 60) % 60;
                            var seconds = $scope.timercounter % 60;
                            $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds);
                            timerData.setMyVoteCounter(0);
                            socket.emit('SyncRealTimeStop');
                            socket.emit('NewTimerCounter',($scope.MinTimeLimit));

                            socket.emit('SyncRealTimePlay');

                        })
                        .error(function (err) {$location.path('/Meeting');
                            alert("This is not a valid meeting, please check the link")
                        });
                }
            },1000);

        });

        //receiving data
        socket.on('SyncTheTimeNow',function(data){
            console.log("STOP! Sync Time!");
            $scope.handleClientSyncPlay(data);

            $("#startBtn").hide("slow");
            $("#pauseBtn").show("slow");
            $("#stopBtn").show("slow");
        });
        socket.on('SyncTheTimePaused',function(){
            $("#startBtn").show("slow");
            $("#pauseBtn").hide("slow");
            $("#stopBtn").show("slow");
        });
        socket.on('SyncTheTimeStopped',function(){

            $("#startBtn").show("slow");
            $("#pauseBtn").show("slow");
            $("#stopBtn").hide("slow");
        });

        //emitting data
        $scope.play = function(){
            timer_id= setInterval(function () {
                if(time_counter>=0){
                    time_counter--;}
            }, 1000);
            $("#startBtn").hide("slow");
            $("#pauseBtn").show("slow");
            $("#stopBtn").show("slow");
            socket.emit('SyncRealTimePlay');
            console.log('I have clicked play!');
        }
        $scope.pause = function(){
            socket.emit('SyncRealTimePause');
            clearInterval(timer_id);
            $scope.handleClientSyncPlay(time_counter);
            console.log('I have clicked pause!');
            $("#startBtn").show("slow");
            $("#pauseBtn").hide("slow");
            $("#stopBtn").show("slow");

        }
        $scope.stop = function(){
            socket.emit('SyncRealTimeStop');
            socket.emit('NewTimerCounter',(myTime));
            clearInterval(timer_id);
            time_counter =myTime;
            $scope.handleClientSyncPlay(time_counter);

            console.log('I have clicked stop!');
            $("#startBtn").show("slow");
            $("#pauseBtn").show("slow");
            $("#stopBtn").hide("slow");
            $(".myTimerDisplay").css("color","black").finish();
        }

        //data handlers
        $scope.handleClientSyncPlay = function(data){
            $scope.timercounter = data;
            var hours = parseInt( $scope.timercounter / 3600 ) % 24;
            var minutes = parseInt( $scope.timercounter / 60 ) % 60;
            var seconds = $scope.timercounter % 60;
            $scope.timestuff = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds  < 10 ? "0" + seconds : seconds);
            console.log( "$scope.timercounter :"+ $scope.timercounter);
            console.log( "$scope.MinTimeLimit :"+$scope.MinTimeLimit);
            if($scope.timercounter <= $scope.MinTimeLimit && $scope.timercounter!=0){
                $(".myTimerDisplay").css("color","red").fadeOut("slow");
                $(".myTimerDisplay").css("color","red").fadeIn("slow");
            }

        };
    });