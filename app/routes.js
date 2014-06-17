/**
 * Created by harsha on 6/13/14.
 */
var Meeting = require('./models/meeting');

module.exports = function(app){

    app.post('/api/meetings', function(req, res){
        console.log("In Post Method");
        console.log(req.body);
        Meeting.create({
            meetingName: req.body.meetingName,
            initiatorName: req.body.initiatorName
        }, function (err, meeting) {
            if(err)
                res.send(err);
            console.log(meeting);
            res.json(meeting);
//            Meeting.find(function(err, meetings){
//               if(err)
//                    res.send(err)
//               res.json(meetings);
//            });
        });

    });

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });

}