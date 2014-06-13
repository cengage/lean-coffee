/**
 * Created by mindtap on 6/13/14.
 */
/**
 * Created by harsha on 6/11/14.
 */

var mongoose = require('mongoose');

module.exports = mongoose.model('Meeting', {

    meetingName : String,
    initiator : String
//    topics : [
//        {
//            title: String,
//            content: String,
//            status: String,
//            votes: Number,
//            assignedTo: String
//        }
//    ],
//    users : [
//        {
//            name: String,
//            votesRem: Number
//        }
//    ]

});