exports.error = function(msg) {
  msg = msg || 'ERROR';
  console.log('\x1b[31m', msg, '\x1b[0m');
};

exports.success = function(msg) {
  msg = msg || 'SUCCESS';
  console.log('\x1b[32m', msg, '\x1b[0m');
};
