const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const csvServiceFields = {
  brandNameVehicle: String,
  modelNameVehicle: String,
  yearManufacture: String,
  motor: String,
  transmission: String,
  mileage: Number,
  revisions: String,

  brandVehicle: {
    type: Types.ObjectId,
    ref: 'Brand'
  },

  modelVehicle: {
    type: Types.ObjectId,
    ref: 'Model'
  }
};

const csvServiceSchema = new Schema(csvServiceFields, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

csvServiceSchema.virtual('id').get(function () {
  return this._id;
});

module.exports = mongoose.model('ServiceCSV', csvServiceSchema);
