var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , shortid = require('shortid');

var emailSchema = new Schema({
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  textButton: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  greeting: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, {_id: false});

var clientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: String,

  cellphone: {type: String},
  // _emailValues: {
  //   type: emailSchema, required: false
  // },
  statusEmail: {type: String, default: 'bounce'},
  didSchedule: {type: Boolean, default: false},
  didSendEmail: {type: Boolean, default: false},
  didSendSms: {type: Boolean, default: false},
  didSendNotification: {type: Boolean, default: false}
}, {_id: false});


var smsSchema = new Schema({
  content: {
    type: String,
    required: true
  }
}, {_id: false});

var notificationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {_id: false});

var Campaign = new Schema({
  shortid: {
    type: String,
    required: true,
    default: shortid.generate,
    index: {
      unique: true
    }
  },
  name: String,
  clients: [clientSchema],

  emailValues: {
    type: emailSchema,
    required: false
  },

  link: String,
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  sms: {
    type: smsSchema, required: false
  },
  notification: {
    type: notificationSchema, required: false
  },
  statistics: {
    sentEmail: {type: Number, default: 0, required: true},
    sentSMS: {type: Number, default: 0, required: true},
    sentNotification: {type: Number, default: 0, required: true},
    open: {type: Number, default: 0, required: true},
    converted: {type: Number, default: 0, required: true},
  },
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', Campaign);
