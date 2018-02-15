var mongoose = require('mongoose')
  , mongoosePaginate = require('mongoose-paginate')
  , Schema = mongoose.Schema,
  _ = require('lodash');

var SpendingSchema = new Schema({
  fuel: {type: String},
  pricePerLiter: {type: String},
  washType: {type: String},
  address: {type: String},
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
    default: void 0
  }],
  amountPaid: {type: Number},
  financer: {type: String},
  insurer: {type: String},
  parcelLength: {type: Number},
  totalCost: {type: Number},
  dueDate: {type: Date},
  spendingType: {
    type: String,
    enum: [
      'supply', 'park', 'carWash', 'maintenance', 'toll',
      'insurance', 'taxes', 'traficTicket', 'licensing',
      'financing'
    ]
  },
  km: {type: Number},
  date: {type: Date},
  time: {type: String},
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  }
}, {timestamps: true});

SpendingSchema.pre('save', function (next) {
  if (this.services.length === 0) {
    this.services = undefined;
  }
  next();
});


module.exports = mongoose.model('Spending', SpendingSchema);
