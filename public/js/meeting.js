/**
 * Created by mindtap on 6/13/14.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('Meeting', {
    meetingName : String,
    initiatorName : String,
    configurations : {
        timePerTopic : Number,
        extraTimePerTopic: Number,
        votesPerUser: Number
    },
    createdAt : { type: String, default: Date.now() },
    users : [
        {
            email : { type: String },
            name : String,
            votesRemaining : Number
        }
    ],
    topics : [
        {
            title : { type: String },
            content : String,
            status : String,
            votes : Number,
            assignedTo : String
        }
    ]
});