/**
 * Created by mindtap on 6/5/14.
 */
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});