/**
 * Created by mindtap on 6/5/14.
 */
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var people = {}

var mongoose = require('mongoose');
var database = require('./config/database');

mongoose.connect(database.url);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
});

server.listen('4545');