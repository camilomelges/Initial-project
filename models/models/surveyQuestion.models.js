var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SurveySchema = new Schema({
  question: {
    type: String,
    required: true
  },
  crmLabel: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SurveyQuestion', SurveySchema);
