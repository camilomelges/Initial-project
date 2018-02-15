/**
 * Created by keyboard99 on 5/16/17.
 */
(function () {
  'use strict';

  angular
    .module('app')
    .service('docValidator', docValidator);
    function docValidator () {
      this.validate = function (string) {

        var validation = {valid: undefined, type: undefined};

        var CNPJPattern = /([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})/;
        var CPFPattern = /[0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2}/;

        if(string.match(CNPJPattern)){
          validation.valid = true;
          validation.type = 'cnpj';
        }
        else if (string.match(CPFPattern)){
          validation.valid = true;
          validation.type = 'cpf';
        }
        else if(string.length > 0) {
          validation.valid = true;
          validation.type = 'name';
        }
        return validation;
      }
    }
}());

