var integers = require('./constants/integers');

function Response (code, message, data) {
  this.data = data;
  this.code = String(code);
  this.message = message;

  if(code === integers.CODE_ERROR_MISSING_PARAMETER)
    this.message = "'" + this.message + "' parameter is missing";
}

module.exports = Response;
