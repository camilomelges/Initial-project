var mongoose = require('mongoose')
  , mongoosePaginate = require('mongoose-paginate')
  , Schema = mongoose.Schema;

var SurveySchema = new Schema({
  question: {
    type: Schema.Types.ObjectId,
    ref: 'SurveyQuestion',
    required: true
  },
  scheduleRef: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
  },
  chatRef: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
  },
  vehicleRef: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  serviceNote: {
    type: Number,
    enum: [0, 100],
    required: true,
    default: 0
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  surveyAnswered: {
    type: Boolean,
    default: false,
    required: true
  },
  surveySent: {
    type: Boolean,
    default: false,
    required: true
  },
  observation: {
    type: String,
    default: ""
  },
  situation: {
    type: String,
    enum: ["published", "scheduled"],
    required: true
  },
  scheduledDate: {
    type: Date
  }
}, {
  timestamps: true
});

SurveySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Survey', SurveySchema);
