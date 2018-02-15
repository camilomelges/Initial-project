/**
 * Created by atomicavocado on 18/04/17.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('lodash');

var timeSchema = new Schema({
  date: {type: String, required: true},
  dateISO: {type: Date, required: true},
  time: {type: String, required: true}
}, {_id: false});

var executedSchema = new Schema({
  date: {type: String, required: true},
  with: {type: String, required: true}
}, {_id: false});

var inspectionSchema = new Schema({
  km: {type: Number, required: true},
  age: {type: Number},
  time: String,
  items: []
}, {_id: false});

var deadlockSchema = new Schema({
  motive: {
    type: String,
    enum: ['not-now', 'call-later', 'no-answer', 'voicemail', 'nonexistent-phone', 'client-gave-up', 'already-scheduled'],
    required: true
  },
  callAgainAt: timeSchema,
  description: {type: String},
  executed: executedSchema,
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {_id: false});

var ScheduleRequestSchema = new Schema({
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
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  callMeAt: timeSchema,
  otherService: {
    type: String
  },
  observation: {
    type: String
  },
  inspection: inspectionSchema,
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  status: {
    type: String,
    enum: ['requested', 'pending', 'canceled', 'confirmed'],
    required: true
  },
  deadlocks: [deadlockSchema],
  generatedSchedule: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
    required: false
  },
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScheduleRequest', ScheduleRequestSchema);
