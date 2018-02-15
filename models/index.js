'use strict';

var _ = require('lodash');
var db = require('./lib/database');
var glob = require('glob');
var path = require('path');


var getGlobbedFiles = function(globPatterns, removeRoot) {
  var _this = this;

  var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

  var output = [];

  if (_.isArray(globPatterns)) {
    globPatterns.forEach(function(globPattern) {
      output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
    });
  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      var files = glob.sync(globPatterns);
      if (removeRoot) {
        files = files.map(function(file) {
          return file.replace(removeRoot, '');
        });
      }
      output = _.union(output, files);
    }
  }

  return output;
};

module.exports = function() {
  var lib = {
    //init: function(uri, options) {
      //if (!uri) {
        //throw new Error('uri is required');
        //return false;
      //}
      //db(uri, options);
    //}
    init: function(e) {
      getGlobbedFiles(path.resolve(__dirname, './models/*.js')).forEach(function(modelPath) {
        require(path.resolve(modelPath));
      });
    }
  };

  return lib;
}()
