var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
    schema = mongoose.Schema,
    User= new schema({
        userName    :String,
        createdDate :{type:Date,default:Date.now}
    });
var database = require('./public/js/database');
mongoose.connect(database.url, function(err){
    if(err)
        throw  err;
    else
        console.log("all is well")
});


var UserListModel = mongoose.model('User',User)

//var people = {};

app.configure('development',function() {
    app.use('/public', express.static(__dirname + '/public'));
    app.use('/node_modules', express.static(__dirname + '/node_modules'));
    app.use(express.errorHandler());
    app.use(express.bodyParser()); 							// pull information from html in POST
    app.use(express.methodOverride()); 						// simulate DELETE and PUT
  });

require('./public/js/routes.js')(app);
io.sockets.on('connection', function(socket) {
    //detect users
    console.log('a user connected');
    //get a unique address for each client
    console.log('I am '+socket.id +'!');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });


    socket.on('joinBoard', function(data) {
        socket.broadcast.emit('onJoin', data);
    });

    socket.on('userJoin', function(data) {
        console.log('emit user joining event');
        var newUser = new UserListModel({userName:data});
        newUser.save(function(err){
            if(err)
                throw  err;
            else
                people = data;
            socket.broadcast.emit('onUserJoin', people);
        });

    });

    socket.on('createNote', function(data) {
        console.log('emit note creating event');
        socket.broadcast.emit('onNoteCreated', data);
    });

    socket.on('updateNote', function(data) {
        socket.broadcast.emit('onNoteUpdated', data);
    });

    socket.on('moveNote', function(data){
        socket.broadcast.emit('onNoteMoved', data);
    });

    socket.on('deleteNote', function(data){
        socket.broadcast.emit('onNoteDeleted', data);
    });

    socket.on('play', function(data){
        socket.broadcast.emit('onplay', data);
    });

    socket.on('pause', function(data){
        socket.broadcast.emit('onpause', data);
    });

    socket.on('stop', function(data){
        socket.broadcast.emit('onstop', data);
    });
});

server.listen(process.env.PORT || 4545);
