var mongoose = require('mongoose')
  , shortid = require('shortid')
  , Schema = mongoose.Schema;

var campaignSchema = new Schema({
  shortid: {
    type: String,
    default: shortid.generate,
    required: true,
    index: {
      unique: true
    }
  },
  name: {
    type: String,
    required: true
  },
  statisticsEmail: {
    sent: {type: Number, default: 0, required: true},
    converted: {type: Number, default: 0, required: true}
  },
}, {_id: false});

var Relationship = new Schema({
  name: {
    type: String,
    required: true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  campaigns: [campaignSchema],
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  }
});

module.exports = mongoose.model('Relationship', Relationship);
