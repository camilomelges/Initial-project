var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('lodash');

var ServiceSchema = new Schema({
  name: String,
  description: String,
  image: {
    type: String,
    default: "https://s3-sa-east-1.amazonaws.com/automobi-public/assets/services/default.png",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);
