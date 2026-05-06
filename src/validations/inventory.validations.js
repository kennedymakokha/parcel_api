"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInventoryInput = void 0;
var validator_1 = require("validator");
var isEmpty_1 = require("../utils/isEmpty");
var validateInventoryInput = function (data) {
    var errors = {};
    data.product = !(0, isEmpty_1.isEmpty)(data.product) && data.product !== undefined ? data.product : '';
    data.quantity = !(0, isEmpty_1.isEmpty)(data.quantity) && data.quantity !== undefined ? data.quantity : 0;
    if (validator_1.default.isEmpty(data.product)) {
        errors.product = 'Select a product';
    }
    if (validator_1.default.isEmpty(data.quantity)) {
        errors.quantity = 'quantity  field is required';
    }
    return {
        errors: errors,
        isValid: (0, isEmpty_1.isEmpty)(errors)
    };
};
exports.validateInventoryInput = validateInventoryInput;
