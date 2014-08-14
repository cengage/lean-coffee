var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose');
//    schema = mongoose.Schema;
var socketsDict = new Array();

var database = require('./public/js/database');

mongoose.connect(database.url, function(err){
    if(err)
        throw  err;
    else
        console.log("MongoDB is up and running")
});

app.configure('development',function() {
    app.use('/public', express.static(__dirname + '/public'));
    app.use('/node_modules', express.static(__dirname + '/node_modules'));
    app.use(express.errorHandler());
    app.use(express.bodyParser()); 							// pull information from html in POST
    app.use(express.methodOverride()); 						// simulate DELETE and PUT
});

require('./public/js/routes.js')(app);
var time_counter = 0;
var myTime =0;
var timer_id=0;
io.sockets.on('connection', function(socket) {
    //detect users
    //console.log('a user connected');
    //get a unique address for each client
    //console.log('I am '+socket.id +'!');

    socket.on('joinMeeting', function (meetingId) {
       // console.log("Meeting ID is : "+meetingId + " "+socket.id);
//        socket.set('room', meetingId, function() { console.log('room ' + meetingId + ' saved'); } );
        socketsDict[socket.id] = meetingId;
        socket.join(meetingId);
    });

    socket.on('disconnect', function(){
        delete socketsDict[socket.id];
        console.log('user disconnected');
    });


    socket.on('joinBoard', function(data) {
        socket.broadcast.to(socketsDict[socket.id]).emit('onJoin', data);
    });

    socket.on('userJoin', function(data) {
        console.log('emit user joining event');
        socket.broadcast.to(socketsDict[socket.id]).emit('onUserJoin', data);

    });

    socket.on('createChat', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onCreateChat', data);
    });

    socket.on('createNote', function(data) {
        // console.log('emit note creating event');
        socket.broadcast.to(socketsDict[socket.id]).emit('onNoteCreated', data);
    });

    socket.on('updateNote', function(data) {
        socket.broadcast.to(socketsDict[socket.id]).emit('onNoteUpdated', data);
    });

    socket.on('moveNote', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onNoteMoved', data);
    });

    socket.on('voteUp', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onVoteUp', data);
    });

    socket.on('voteUpThisNote', function(data){
//        socket.broadcast.emit('onVoteUpThisNote', data)
        socket.broadcast.to(socketsDict[socket.id]).emit('onVoteUpThisNote', data);
    });

    socket.on('voteDownThisNote', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onVoteDownThisNote', data);
    });

    socket.on('statusChange', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onStatusChange', data);
    });

    socket.on('resetVotes', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onResetVotes', data);
    });

    socket.on('saveConfig', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onSaveConfig', data);
    });

    socket.on('deleteNote', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onNoteDeleted', data);
    });

    socket.on('play', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onplay', data);
    });

    socket.on('pause', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onpause', data);
    });

    socket.on('stop', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onstop', data);
    });


    socket.on('SyncRealTimePlay',function(){
        handleServerPlay();
    });
    socket.on('SyncRealTimePause',function(){
        handleServerPause();
    });
    socket.on('SyncRealTimeStop',function(){
        handleServerStop();
    });
    socket.on('NewTimerCounter',function(data){
        console.log("timerdata is :" + data);
        time_counter = data;
        myTime =data;
    });
    var handleServerPlay = function(){
        timer_id= setInterval(function () {
            if(time_counter>=0){
                io.sockets.in(socketsDict[socket.id]).emit('SyncTheTimeNow',time_counter);
                console.log("time_counter :"+ time_counter);
                time_counter--;}
        }, 1000);

    };
    var handleServerPause = function(){
        clearInterval(timer_id);
        console.log("time_counter paused");
        socket.broadcast.to(socketsDict[socket.id]).emit('SyncTheTimeNow',time_counter);
        socket.broadcast.to(socketsDict[socket.id]).emit('SyncTheTimePaused',time_counter);
    };
    var handleServerStop = function(){
        time_counter =myTime;
        clearInterval(timer_id);
        console.log("time_counter stopped and reset to :" + time_counter);
        socket.broadcast.to(socketsDict[socket.id]).emit('SyncTheTimeNow',time_counter);
        socket.broadcast.to(socketsDict[socket.id]).emit('SyncTheTimeStopped',time_counter);
    };

    socket.on('ResetVoteThisNote', function(data){
        socket.broadcast.to(socketsDict[socket.id]).emit('onResetVoteThisNote', data);
    });

});

server.listen(process.env.PORT || 4545, function(){
    console.log("Lean Coffee is running at port 4545");
});
