var mongoose = require('mongoose')
  , mongoosePaginate = require('mongoose-paginate')
  , Schema = mongoose.Schema,
  _ = require('lodash');

var inspectionSchema = new Schema({
  km: {type: Number, required: true},
  age: {type: Number},
  time: String,
  items: []
}, {_id: false});

var serviceDetailSchema = new Schema({
  service: {type: Schema.Types.ObjectId, required: true},
  name: {type: String},
  durationTime: {type: Number},
  type: {type: String, enum: ['inspection', 'diagnostic', 'other']},
  inspectionKm: {},
  inspectionTime: {},
  diagnosticObservation: String,
}, {_id: false});

var ScheduleSchema = new Schema({
  origin: {
    type: String,
    default: 'CRM',
    required: true
  },
  originRules: {
    relationship: {
      _id: Schema.Types.ObjectId,
      campaign: {shortid: String}
    }
  },
  observation: {
    type: String
  },
  otherService: String,
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
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
  services: [{type: Schema.Types.ObjectId, ref: 'Service'}],
  servicesDetails: [serviceDetailSchema],
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dateFinished: {
    type: Date
  },
  date: {
    type: String,
    required: true
  },
  dateISO: {
    type: Date,
    required: true
  },
  hour: {type: String, required: true},
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
  scheduleRequest: {
    type: Schema.Types.ObjectId,
    ref: 'ScheduleRequest'
  },
  //local
  idState: {
    type: Schema.Types.ObjectId,
    ref: 'State'
  },
  state: String,
  stateInitials: String,
  stateInitals: String,
  idCity: {type: Schema.Types.ObjectId},
  city: String,
  district: String,
  address: {
    type: String
  }
}, {
  timestamps: true
});

ScheduleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Schedule', ScheduleSchema);
