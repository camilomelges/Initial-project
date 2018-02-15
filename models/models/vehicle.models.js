var mongoose = require('mongoose')
  , mongoosePaginate = require('mongoose-paginate')
  , Schema = mongoose.Schema;

var inspectionSchema = new Schema({
  km: {type: String},
  date: {type: Date}
},{_id: false});

var VehicleSchema = new Schema({
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: false
  },
  idUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  idCustomer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  },
  purchaseDate: {
    type: Date
  },
  idBrand: {
    type: Schema.Types.ObjectId,
    required: false
  },
  brand: {
    type: String,
    required: true
  },
  idName: {
    type: Schema.Types.ObjectId,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  appvehicle: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  idSpecification: {
    type: Schema.Types.ObjectId,
    required: false
  },
  specification: {
    type: String,
    required: false
  },
  year: {
    type: Number,
    required: false
  },
  lastKmUpdate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  outdated: {
    type: Boolean,
  },
  model: {
    type: Number,
    required: false
  },
  chassi: String,
  km: {
    type: Number
  },
  plate: String,
  renavam: String,
  inspection: inspectionSchema,
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  schedules: [{
    type: Schema.Types.ObjectId,
    ref: 'Schedule'
  }]
}, {
  timestamps: true
});

VehicleSchema.plugin(mongoosePaginate);

VehicleSchema.pre('save', function (next) {
  var newVehicle = this;

  this.constructor.findById(newVehicle._id, (err, vehicle) => {
    if (vehicle && vehicle.km !== newVehicle.km) newVehicle.lastKmUpdate = Date.now();
    next(err, newVehicle);
  });
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
