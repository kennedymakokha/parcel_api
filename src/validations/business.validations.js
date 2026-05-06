"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePickupInput = exports.validateBusinessInput = void 0;
var validator_1 = require("validator");
var isEmpty_1 = require("../utils/isEmpty");
var validateBusinessInput = function (data) {
    var errors = {};
    data.business_name = !(0, isEmpty_1.isEmpty)(data.business_name) && data.business_name !== undefined ? data.business_name : '';
    data.phone_number = !(0, isEmpty_1.isEmpty)(data.phone_number) && data.phone_number !== undefined ? data.phone_number : '';
    data.postal_address = !(0, isEmpty_1.isEmpty)(data.postal_address) && data.postal_address !== undefined ? data.postal_address : '';
    data.kra_pin = !(0, isEmpty_1.isEmpty)(data.kra_pin) && data.kra_pin !== undefined ? data.kra_pin : '';
    data.api_key = !(0, isEmpty_1.isEmpty)(data.api_key) && data.api_key !== undefined ? data.api_key : '';
    data.master_ke = !(0, isEmpty_1.isEmpty)(data.master_ke) && data.master_ke !== undefined ? data.master_ke : '';
    data.contact_number = !(0, isEmpty_1.isEmpty)(data.contact_number) && data.contact_number !== undefined ? data.contact_number : '';
    data.description = !(0, isEmpty_1.isEmpty)(data.description) && data.description !== undefined ? data.description : '';
    if (validator_1.default.isEmpty(data.business_name)) {
        errors.business_name = 'Name  field is required';
    }
    if (validator_1.default.isEmpty(data.kra_pin)) {
        errors.kra_pin = 'KRA Pin  field is required';
    }
    if (validator_1.default.isEmpty(data.phone_number)) {
        errors.phone_number = 'phone number  field is required';
    }
    if (validator_1.default.isEmpty(data.contact_number)) {
        errors.contact_number = 'contact number  field is required';
    }
    return {
        errors: errors,
        isValid: (0, isEmpty_1.isEmpty)(errors)
    };
};
exports.validateBusinessInput = validateBusinessInput;
var validatePickupInput = function (data) {
    var errors = {};
    data.pickup_name = !(0, isEmpty_1.isEmpty)(data.pickup_name) && data.pickup_name !== undefined ? data.pickup_name : '';
    data.phone_number = !(0, isEmpty_1.isEmpty)(data.phone_number) && data.phone_number !== undefined ? data.phone_number : '';
    data.contact_number = !(0, isEmpty_1.isEmpty)(data.contact_number) && data.contact_number !== undefined ? data.contact_number : '';
    data.description = !(0, isEmpty_1.isEmpty)(data.description) && data.description !== undefined ? data.description : '';
    if (validator_1.default.isEmpty(data.pickup_name)) {
        errors.pickup_name = 'Name  field is required';
    }
    if (validator_1.default.isEmpty(data.phone_number)) {
        errors.phone_number = 'phone number  field is required';
    }
    if (validator_1.default.isEmpty(data.contact_number)) {
        errors.contact_number = 'contact number  field is required';
    }
    return {
        errors: errors,
        isValid: (0, isEmpty_1.isEmpty)(errors)
    };
};
exports.validatePickupInput = validatePickupInput;
