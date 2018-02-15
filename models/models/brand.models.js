var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  config = require('../../config/config');

var BrandSchema = new Schema({
  name: {type: String, required: true, unique: true},
  cid: Number,
  slug: String,
  models: [{type: Schema.Types.ObjectId, ref: 'Model'}]
}, {
  timestamps: true
});
var staticData = mongoose.createConnection(config.staticUri, config.dbOptions);

module.exports = staticData.model('Brand', BrandSchema);
