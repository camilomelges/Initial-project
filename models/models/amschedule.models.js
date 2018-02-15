var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('lodash');

var inspectionSchema = new Schema({
  km: {type: Number, required: true},
  age: {type: Number},
  time: String,
  items: []
}, {_id: false});

var ScheduleSchema = new Schema({
  idVehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  idInspection: {
    type: Schema.Types.ObjectId,
    ref: 'Inspection'
  },
  inspection: inspectionSchema,
  services: [{ type : Schema.Types.ObjectId, ref: 'Service' }],
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  dateISO: {
    type: Date,
    required: true
  },
  hour: { type: String, required: true },
  dateFinish: Date,
  status: {
    type: String,
    required: true
  },
  _idLocal: {
    type: Schema.Types.ObjectId
  },
  price: Number,
  opinion: Number,
  badOpinionMsg: String,
  //local
  idState: {
    type: Schema.Types.ObjectId,
    ref: 'State'
  },
  state: String,
  stateInitials: String,
  stateInitals: String,
  idCity: { type: Schema.Types.ObjectId },
  city: String,
  district: String,
  others: String,
  partner: {
    type: String
  },
  address: {
    type: String
  }
});

module.exports = mongoose.model('AMschedule', ScheduleSchema);
