/**
 * Created by harsha on 6/13/14.
 */
var Meeting = require('./meeting.js');

module.exports = function(app){
    app.post('/api/meetings', function(req, res){
        //res.send(req.body);
       // console.log(req.meetingName);

              Meeting.create({
            meetingName: req.body.meetingName,
            initiatorName: req.body.initiatorName
        }, function (err, meeting) {
            if(err)
                res.send(err);
            console.log(meeting);
            res.json(meeting);

        });

    });

    app.get('/api/meetings', function(req, res){
        console.log("I am also here");
       return Meeting.find(function(err, meetings){
          if(err)
            res.send(err)
          res.send(meetings);
       });
    });

    app.get('/api/meeting/:id', function (req, res){

        return Meeting.find({_id: req.params.id}, function (err, meeting) {
            if (!err) {
                res.send(meeting);
            } else {
                return console.log(err);
            }
        });
    });

    // application -------------------------------------------------------------
    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
    });

}