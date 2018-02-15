/**
 * Created by monking on 03/01/18.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , shortid = require('shortid');

var BugSchema = new Schema({
  summary: {type: String, required: true},
  page: {type: String},
  date: {type: Date},
  hour: {type: String},
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  status: {type: String, default: 'pending'},
  finishedAt: {type: Date, default: ''}
}, {timestamps: true, _id: true});

BugSchema.pre('save', function (next) {
  this.namespace = new mongoose.mongo.ObjectId();

  next(null);
});

module.exports = mongoose.model('Bug', BugSchema);