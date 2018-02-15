var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , shortid = require('shortid');

var Contact = new Schema({
  phone: {type: Number, required: true},
  email: {type: String, required: false}
}, {_id: false});

var Bug = new Schema({
  summary: {type: String, required: true},
  page: {type: String},
  date: {type: Date},
  hour: {type: String},
  status: {type: String, default: 'pending'},
  finishedAt: {type: Date, default: ''}
}, {timestamps: true, _id: true});

var ScheduleSettings = new Schema({
  startTime: {
    type: String,
    required: true,
    default: '08:00'
  },
  endTime: {
    type: String,
    required: true,
    default: '18:00'
  },
  startLunch: {
    type: String,
    required: true,
    default: '11:30'
  },
  endLunch: {
    type: String,
    required: true,
    default: '13:30'
  },
  interval: {
    type: Number,
    required: true,
    default: 30
  },
  maxCarsPerSchedule: {
    type: Number,
    required: true,
    default: 5
  },
  nationalService: Boolean,
  internationalService: Boolean
}, {_id: false});

var BranchSchema = new Schema({
  //infos
  code: {
    type: String,
    required: true,
    default: shortid.generate,
    index: {
      unique: true
    }
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner'
  },
  companyName: {
    type: String,
    required: false
  },
  scheduleSettings: ScheduleSettings,
  //contact
  cnpj: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  address: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  idState: {
    type: Schema.Types.ObjectId,
    ref: 'State'
  },
  image: {
    type: String,
    required: true,
    default: 'https://s3-sa-east-1.amazonaws.com/automobi-public/assets/branches/banner-default.jpg'
  },
  likes: {type: Number, required: true, default: 0},
  state: String,
  namespace: String,
  stateInitials: String,
  idCity: {type: Schema.Types.ObjectId},
  city: String,
  contact: Contact,
  bugs: [Bug],
  services: [{type: Schema.Types.ObjectId, ref: 'Service'}],
  timezone: {
    type: String,
    required: true,
    default: 'America/Sao_Paulo'
  },
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

BranchSchema.pre('save', function (next) {
  this.namespace = new mongoose.mongo.ObjectId();

  next(null);
});

module.exports = mongoose.model('Branch', BranchSchema);
