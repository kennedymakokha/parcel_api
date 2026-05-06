"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductInput = void 0;
var validator_1 = require("validator");
var isEmpty_1 = require("../utils/isEmpty");
var validateProductInput = function (data) {
    var errors = {};
    data.description = !(0, isEmpty_1.isEmpty)(data.description) && data.description !== undefined ? data.description : '';
    data.product_name = !(0, isEmpty_1.isEmpty)(data.product_name) && data.product_name !== undefined ? data.product_name : '';
    data.price = !(0, isEmpty_1.isEmpty)(data.price) && data.price !== undefined ? data.price : 0;
    if (validator_1.default.isEmpty(data.product_name)) {
        errors.product_name = 'Name  field is required';
    }
    if (validator_1.default.isEmpty(data.description)) {
        errors.description = 'description  field is required';
    }
    if (validator_1.default.isEmpty(data.price)) {
        errors.price = 'price  field is required';
    }
    return {
        errors: errors,
        isValid: (0, isEmpty_1.isEmpty)(errors)
    };
};
exports.validateProductInput = validateProductInput;
