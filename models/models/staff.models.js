var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  Schema = mongoose.Schema;

var notificationSchema = new Schema({
  type: {type: String, required: true},
  body: {type: Object, required: true}
}, {
  timestamps: true
});

var crmSchema = new Schema({
  isMenuCollapsed: {
    type: Boolean,
    default: false,
    required: true
  }
}, {_id: false});

var actionSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  },
  stateRoute: {
    type: String,
    required: true
  },
  idAction: {
    type: String,
    required: true
  }
}, {_id: false});

var StaffSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  _crmConfig: {
    type: crmSchema, required: false
  },
  birthDate: {
    type: Date
  },
  image: {
    type: String,
    default: "https://s3-sa-east-1.amazonaws.com/automobi-assets/avatar-azul.png",
    required: true
  },
  cpf: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  phone: String,
  password: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: false
  },
  //permissions
  branches: [{
    type: Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  }],
  role: {
    type: String,
    required: true
  },
  dateCreate: {
    type: Date,
    default: Date.now,
    required: true
  },
  pendingActions: [actionSchema],
  notificationList: [notificationSchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

StaffSchema.path('branches').validate(function (branches) {
  if (!branches) {
    return false
  }
  else if (branches.length === 0) {
    return false
  }
  return true;
}, 'Staff needs to have at least one branch id');

StaffSchema.pre('save', function (next) {
  var staff = this;

  if (this.isNew || this.isModified('password')) {
    bcrypt.hash(staff.password, 10, function (err, hash) {
      if (err) return next(err);
      staff.password = hash;
      return next(null);
    });
  } else {
    return next();
  }
});

StaffSchema.methods.generateToken = function (staff, cb) {
  var tokenObj = {
    name: staff.name,
    lastname: staff.lastname,
    id: staff._id,
    role: staff.role
  };

  if (!GLOBAL.secret) {
    return cb(new Error('GLOBAL.secret for JWT is not defined'), null);
  }

  var token = jwt.sign(tokenObj, GLOBAL.secret);
  cb(null, token);
};

StaffSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

StaffSchema.methods.generateHashPass = function (password, callback) {
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) return callback(err);
    return callback(null, hash);
  });
};

function hashPass(password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return callback(err);
    }
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        return callback(err);
      }
      return callback(null, hash);
    });
  });
}

module.exports = mongoose.model('Staff', StaffSchema);
