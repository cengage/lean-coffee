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
            email : { type: String, unique: true },
            name : String,
            votesRemaining : Number
        }
    ],
    topics : [
        {
            title : { type: String, unique: true },
            content : String,
            status : String,
            votes : Number,
            assignedTo : String
        }
    ]
});