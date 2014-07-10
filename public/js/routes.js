/**
 * Created by harsha on 6/13/14.
 */
var Meeting = require('./meeting.js');

module.exports = function(app){
    app.post('/api/meetings', function(req, res){

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
       return Meeting.find(function(err, meetings){
          if(err)
            res.send(err)
          res.send(meetings);
       });
    });

    app.get('/api/meeting/:id', function (req, res){
        return Meeting.findOne({_id: req.params.id}, function (err, data) {
            if (err){
                res.statusCode = 404;
                return res.send('Error 404: No meeting found with this ID');
            }
            res.json(data);
        });
    });

    app.put('/api/user', function(req, res){
        Meeting.findOneAndUpdate({_id : req.body._id}, {
            $push : { users : req.body.currentUser}
        }, function (err, meeting) {
            if(err)
                res.send(err);
            res.json(meeting);
        });
    });

    app.put('/api/topic', function(req, res){
        Meeting.findOneAndUpdate({_id: req.body._id}, {
            $push : { topics : req.body.currentTopic}
        }, function(err, meeting) {
            if(err)
                res.send(err);
            res.json(meeting);
        })
    });

    app.put('/api/topic/vote', function(req, res){
        Meeting.update( { _id: req.body._id, "topics._id": req.body.currentTopic._id }, {
            $inc: { "topics.$.votes" : 1 }
        }, function(err, meeting) {
            if(err)
                res.send(err);
            res.json(meeting);
        } )
    });

    app.put('/api/topic/changeStatus', function(req, res){
        Meeting.update( { _id: req.body._id, "topics.title": req.body.currentTopic.title }, {
            $set: { "topics.$.status" : req.body.currentTopic.status }
        }, function(err, meeting) {
            if(err)
                res.send(err);
            res.json(meeting);
        } )
    });

    // application -------------------------------------------------------------
    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
    });

}