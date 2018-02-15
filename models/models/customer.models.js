var mongoose = require('mongoose')
  , mongoosePaginate = require('mongoose-paginate')
  , Schema = mongoose.Schema;

const importErrors = new Schema({
  vehicle: Boolean
}, {_id: false});

var CustomerSchema = new Schema({
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
  //infos
  name: {
    type: String,
    required: false
  },
  mobileId: {
    type: String,
    required: false
  },
  mobileActive: {
    type: Boolean
  },
  lastname: {
    type: String,
    required: false
  },
  fullname: {
    type: String
  },
  birthDate: {
    type: Date
  },
  companyName: String,
  //contact
  doc: {
    type: String,
    required: false
  },
  type: {
    type: String, 
    enum: ['physical', 'legal']
  },
  branchesFavorited: [{type: Schema.ObjectId, req: "Branch"}],
  email: String,
  phone: String,
  //local
  idState: {
    type: Schema.Types.ObjectId,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  idCity: {
    type: Schema.Types.ObjectId,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  persona: {
    type: String,
    required: false
  },
  address: String,
  //data
  vehicles: [{type: Schema.Types.ObjectId, ref: 'Vehicle'}],
  phones: [{type: Number}],
  dateCreate: {
    type: Date,
    default: Date.now
  },
  importErrors: {type: importErrors, default: {}}
}, {
  timestamps: true
});

CustomerSchema.pre('save', function (next) {
  this.fullname = this.lastname ? this.name + ' ' + this.lastname : this.name;

  next(null);
});

CustomerSchema.index({_id: 1, partner: 1, mobileId: 1}, {unique: true});
CustomerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Customer', CustomerSchema);
