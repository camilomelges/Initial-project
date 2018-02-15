var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('lodash');

var targetSchema = new Schema({
  name: {type: String, required: true},
  id: {type: String, required: false}
}, {_id: false});

var AmKeySchema = new Schema({
  target: targetSchema,
  key: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
  }
});

module.exports = mongoose.model('amkey', AmKeySchema);
