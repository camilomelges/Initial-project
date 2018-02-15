module.exports = {
  "type": "object",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "properties": {
    "name": {
      "type": "string"
    },
    "lastname": {
      "type": "string"
    },
    "birthDate": {
      "type": "string",
      "format": "date-time"
    },
    "cpf": {
      "type": "string",
      "pattern": "^$||([0-9]{3}[\\.][0-9]{3}[\\.][0-9]{3}[-][0-9]{2})"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "phone": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "branches": {
      "type": "array"
    },
    "role": {
      "type": "string"
    },
    "pendingActions":{
      "type": "array"
    }
  },
  "additionalProperties": false,
  "required": ["password", "email", "name", "lastname", "phone", "branches", "role"]
};
