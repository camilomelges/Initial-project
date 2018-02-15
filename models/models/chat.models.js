'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _ = require('lodash');

var PersonSchema = new Schema({
  root: String,
  name: String,
  lastname: String,
  personPhoto: {
    type: String,
    default: "https://s3-sa-east-1.amazonaws.com/automobi-assets/avatar-cinza.png",
    required: true
  },
}, {_id: false});

var QuestionSchema = new Schema({
  rate: Number,
  observation: String,
  evaluated: Boolean
}, {_id: false});


var Message = {
  _id: mongoose.Schema.Types.ObjectId,
  content: {
    type: String,
    required: false
  },
  origin: {
    type: PersonSchema,
    required: false
  },
  question: {
    type: QuestionSchema,
    required: false
  },
  closure: {
    type: PersonSchema,
    required: false
  },
  dateCreate: {
    type: Date,
    default: Date.now
  }
};

var ChatSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  readInCRM: {
    type: Boolean,
    default: false
  },
  attendant: {
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  lastMessage: Message,
  messages: [Message]
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);
