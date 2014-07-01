/**
 * Created by mindtap on 6/13/14.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('Meeting', {
    meetingName : String,
    initiatorName : String,
    createdAt : { type: String, default: Date.now() },
    users : [
        {
            name : String,
            votesRemaining : Number
        }
    ],
    topics : [
        {
            title : String,
            content : String,
            status : String,
            votes : Number,
            assignedTo : String
        }
    ]
});