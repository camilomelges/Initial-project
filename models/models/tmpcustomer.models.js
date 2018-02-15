var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var inspectionSchema = new Schema({
  km: {
    type: Number,
    required: true
  },
  age: {
    type: Number
  },
  time: String,
  items: []
}, {
  _id: false
});

var TmpCustomerSchema = new Schema({
  name: {
    type: String
  },
  lastname: {
    type: String
  },
  email: String,
  phones: [{
    type: String
  }],
  celphone: String,
  city: {
    type: String
  },
  address: String,
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner'
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  brand: {
    type: String
  },
  model: {
    type: String
  },
  year: {
    type: Number
  },
  plate: {
    type: String
  },
  idModel: {
    type: Schema.Types.ObjectId,
    ref: 'Model'
  },
  km: {
    type: Number
  },
  inspection: inspectionSchema,
  isCustomer: {
    type: Boolean,
    default: false,
    required: true
  },
  idCustomer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  idCampaign: [{
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    require: false
  }],
  dateCreate: {
    type: Date,
    default: Date.now
  }
});

TmpCustomerSchema.index({
  name: 1,
  lastname: 1,
  partner: 1,
  branch: 1,
  km: 1,
  plate: 1,
  email: 1,
  phones: 1,
  celphone: 1
}, {
  unique: true
});

module.exports = mongoose.model('TmpCustomer', TmpCustomerSchema);

