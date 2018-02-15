var mongoose = require('mongoose'),
  config = require('../../config/config'),
  Schema = mongoose.Schema;

var city = new Schema({
  name: {type: String, required: true}
});

var StatesSchema = new Schema({
  name: String,
  initials: String,
  cities: [city]
}, {
  timestamps: true
});

var staticData = mongoose.createConnection(config.staticUri, config.dbOptions);

module.exports = staticData.model('State', StatesSchema, 'states');
