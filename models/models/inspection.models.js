var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('lodash');

var InspectionSchema = new Schema({
  km: {type: Number, required: true},
  age: {type: Number},
  time: String,
  items: []
});

module.exports = mongoose.model('Inspection', InspectionSchema);
