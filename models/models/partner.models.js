var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const moduleSchema = new Schema ({
  chat: {type: Boolean, default: true},
  schedule: {type: Boolean, default: true},
  scheduleRequest: {type: Boolean, default: true}
}, {_id: false});

var PartnerSchema = new Schema({
  //infos
  apphash: {
    type: Schema.Types.ObjectId,
    required: false
  },
  companyName: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String,
    required: false
  },
  bgColor: {
    type: String,
    required: false
  },
  bgPartner: {
    type: String,
    required: false
  },
  metaTag: {
    locale: {
      type: String,
      default: 'pt_BR',
      required: true
    },
    title: {
      type: String
    },
    description: {
      type: String
    },
    image: {
      type: String,
      required: true,
      default: 'https://s3-sa-east-1.amazonaws.com/automobi-public/crm/banner-800-x-600.png'
    },
    imageType: {
      type: String,
      default: 'image/jpg',
      required: true
    },
    imageWidth: {
      type: String,
      default: '800',
      required: true
    },
    imageHeight: {
      type: String,
      default: '600',
      required: true
    },
    url: {
      type: String
    },
    siteName: {
      type: String
    },
    robots: {
      type: String,
      default: 'noindex, nofollow',
      required: true
    },
    author: {
      type: String,
      default: 'Automobi',
      required: true
    }
  },
  branches: [{type: Schema.Types.ObjectId, ref: "Branch"}],
  address: {
    type: String,
    required: false
  },
  brands: [{
    type: Schema.Types.ObjectId,
    ref: "Brand",
    required: false
  }],
  idState: {
    type: Schema.Types.ObjectId,
    ref: 'State'
  },
  state: String,
  stateInitials: String,
  idCity: {type: Schema.Types.ObjectId},
  city: String,
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  },
  operationWeekend: {
    saturday: {type: Boolean, default: true},
    sunday: {type: Boolean, default: false}
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  modules: moduleSchema,
  scheduleModule: {type: String, enum: ['schedulerequest', 'schedule'], default: 'schedule'}
}, {
  timestamps: true
});

module.exports = mongoose.model('Partner', PartnerSchema);
