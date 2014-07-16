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
        Meeting.update( { _id: req.body._id, "topics._id": req.body.currentTopic._id }, {
            $set: { "topics.$.status" : req.body.currentTopic.status, "topics.$.votes" : req.body.currentTopic.votes}
        }, function(err, meeting) {
            if(err)
                res.send(err);
            res.json(meeting);
        } )
    });

    app.put('/api/topic/remove', function(req, res){
       Meeting.update( { _id: req.body._id}, {
           $pull: {topics: req.body.currentTopic}
           },function(err, meeting) {
               if(err)
                   res.send(err);
               res.json(meeting);
           } )
    });

    app.put('/api/user/decVote', function(req, res){
        Meeting.update({ _id: req.body._id, "users._id": req.body.currentUser._id}, {
            $inc: {"users.$.votesRemaining" : -1}
        }, function(err, meeting){
            if(err)
                res.send(err);
            res.json(meeting);
        })
    });

    app.put('/api/resetVotes', function(req, res){
//        Meeting.update({ _id: req.body.id, "topics.votes": {$gte: 1}}, {
//                $set : {"topics.$.votes" : 0}
//            }, function(err, meeting){
//            if(err)
//                res.send(err);
//            res.json(meeting);
//        })
        Meeting.update({
            "_id" : req.body._id
        }, {
            $set: {
                topics: req.body.topics,
                users: req.body.users
            }
        },function(err, meeting){
            if(err)
                res.send(err);
            res.json(meeting);
        });
    });

//    app.put('/api/users/resetVotes', function(req, res){
//        Meeting.update({ _id: req.body.id, "users.votesRemaining": {$lt: 5}}, {
//            $set : {"users.$.votesRemaining" : 5}
//        }, function(err, meeting){
//            if(err)
//                res.send(err);
//            res.json(meeting);
//        })
//    });

    // application -------------------------------------------------------------
    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
    });

}