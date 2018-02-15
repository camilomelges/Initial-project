var mongoose = require('mongoose')
  , Schema = mongoose.Schema,
  _ = require('lodash');

var NoteSchema = new Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  photos: [{name: String, link: String}],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  }
}, {timestamps: true});


module.exports = mongoose.model('Note', NoteSchema);
