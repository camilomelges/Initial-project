var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PermissionSchema = new Schema({
  name: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Permission', PermissionSchema, 'permissions');
