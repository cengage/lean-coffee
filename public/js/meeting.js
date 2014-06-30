/**
 * Created by mindtap on 6/13/14.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('Meeting', {
   meetingName : String,
   initiatorName : String,
   createdAt : { type: Date, default: Date.now() }
   });