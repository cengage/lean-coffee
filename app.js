/**
 * Created by mindtap on 6/5/14.
 */
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@novus.modulusmongo.net:27017/Sope5him');

var Meeting = mongoose.model('Meeting', {
    meetingName: String,
    initiatorName: String
});

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

server.listen('4545');