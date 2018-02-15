module.exports = function (app) {
  
  const async = require('async'),
    crypto = require('crypto'),
    _ = require('lodash'),
    Staff = require(global.getModel('staff')),
    Ajv = require('ajv'),
    jwt = require('jsonwebtoken'),
    config = require('../../config/config'),
    AmKey = require(global.getModel('amkey')),
    ajv = new Ajv(),
    controller = {};

  controller.staffLogin = function (req, res) {
    if (!req.body.email) {
      res.status(400).json({
        message: 'E-mail required'
      });
      return;
    }
    if (!req.body.password) {
      res.status(400).json({
        message: 'Password required'
      });
      return;
    }

    Staff.findOne({email: req.body.email})
      .populate({
        path: 'branches',
        select: 'companyName partner',
        populate: {
          path: 'partner',
          select: 'companyName scheduleModule modules'
        }
      })
      .populate({
        path: 'pendingActions.branch',
        select: 'companyName partner'
      })
      .exec(function (err, staff) {
        if (err)
          return res.status(500).json(err);
        
        if (!staff)
          return res.status(401).json({message: 'Authentication failed, try again.'});

        staff.comparePassword(req.body.password, function (err, valid) {
          if (err) 
            return res.status(500).json(err);
          
          if (!valid) 
            return res.status(401).json(res, 'Authentication failed, try again.');
          
          staff.generateToken(staff, function (tokenErr, token) {
            staff.token = token;
            staff.save(function (err, authStaff) {
              authStaff = authStaff.toObject();
              authStaff = _.omit(authStaff, ['password', '__v']);
              return res.status(201).json(authStaff);
            })
          });

        });
      });
  };

  controller.verify = function (req, res, next) {
    var token = req.headers['authorization'];
    var amkey = req.headers['amkey'];
    var partner = req.headers['partner'];
    var branch = req.headers['branch'];

    if (token) {
      if (!partner || !branch) return res.status(403).json('Incomplete headers');

      authorizeToken(token, (err, decoded) => {
        if (err) return res.status(401).json(err);

        var query = {
          _id: decoded.id,
          token: token
        };

        Staff.findOne(query, function (err, staff) {
          if (err) return res.status(500).json(err);
          if (!staff) return res.status(401).json('Failed to authenticate token.');
          if (!staff.active) return res.status(403).json('Your account is not active.');

          staff = staff.toObject();
          staff = _.omit(staff, ['password', '__v']);
          staff.partner = partner;
          staff.branch = branch;
          req._staff = staff;
          req._partnerID = partner;
          return next();
        });
      });

    } else if (amkey) {
      authorizeToken(amkey, (err, decoded) => {
        if (err) return res.status(401).json(err);
        AmKey.findOne({key: amkey}, (err, data) => {
          if (err || !data) return res.status(401).json(err);

          req.headers.partner = decoded.partner;
          req.headers.branch = decoded.branch;

          return next();
        });
      });
    }
    else {
      return res.status(401).json('Failed to authenticate token.');
    }
  };

  function authorizeToken(token, callback) {
    jwt.verify(token, global.secret, function (err, decoded) {
      if (err) {
        return callback('Failed to authenticate token.');
      } else {
        if (!decoded) return callback('Failed to authenticate token.');

        callback(err, decoded);
      }
    });
  }

  return controller;
};
