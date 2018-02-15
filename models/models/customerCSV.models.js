const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const csvCustomerFields = {
  name: String,
  address: String,
  city: String,
  fone: String,
  cellphone: String,
  email: String,
  brandNameVehicle: String,
  modelNameVehicle: String,
  yearManufacture: String,
  motor: String,
  transmission: String,
  placa: String,
  dateSale: Date,

  brandVehicle: {
    type: Types.ObjectId,
    ref: 'Brand'
  },

  modelVehicle: {
    type: Types.ObjectId,
    ref: 'Model'
  },

  partner: {
    type: Types.ObjectId,
    ref: 'Partner'
  },

  customer: {
    type: Types.ObjectId,
    ref: 'Customer'
  }
};

const csvCustomerSchema = new Schema(csvCustomerFields, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

csvCustomerSchema.virtual('id').get(function () {
  return this._id;
});

module.exports = mongoose.model('CustomerCSV', csvCustomerSchema);
