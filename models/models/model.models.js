const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
const config = require('../../config/config');

const revisions = new Schema({
  motor: String,
  transmission: String,
  mileage: Number,
  services: String,
  serviceCSV: {
    type: Types.ObjectId,
    ref: 'ServiceCSV'
  }
}, {_id: false});

const specifications = new Schema({
  name: {type: String, required: true},
  espid: {type: String, required: true},
  slug: {type: String},
  type: {type: String, enum: ['car', 'truck', 'motorcycle']}
});

specifications.index({'_id': 1});

const modelYears = new Schema({
  year: {type: Number, required: true},
  specifications: [specifications],
  revisions: [revisions]
}, {_id: false});

const ModelSchema = new Schema({
  brand: {type: Schema.Types.ObjectId, ref: 'Brand'},
  name: {type: String, required: true},
  modelYears: [modelYears],
  mid: String,
  slug: String
}, {
  timestamps: true
});

var staticData = mongoose.createConnection(config.staticUri, config.dbOptions);

module.exports = staticData.model('Model', ModelSchema);
