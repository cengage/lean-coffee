/**
 * Created by mindtap on 6/5/14.
 */
var express = require('express'),
    app = express();
//    server = require('http').createServer(app),
//    io = require('socket.io').listen(server);

var mongoose = require('mongoose');
var database = require('./config/database');

mongoose.connect(database.url);
//mongoose.connect('mongodb://localhost:27017/test');

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.use(express.logger('dev')); 						// log every request to the console
    app.use(express.bodyParser()); 							// pull information from html in POST
    app.use(express.methodOverride()); 						// simulate DELETE and PUT
});

require('./app/routes.js')(app);

app.listen(process.env.PORT || 4545);