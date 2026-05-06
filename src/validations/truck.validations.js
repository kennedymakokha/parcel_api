"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTruckInput = void 0;
var validator_1 = require("validator");
var isEmpty_1 = require("../utils/isEmpty");
var validateTruckInput = function (data) {
    var errors = {};
    data.plate = !(0, isEmpty_1.isEmpty)(data.plate) && data.plate !== undefined ? data.plate : '';
    data.model = !(0, isEmpty_1.isEmpty)(data.model) && data.model !== undefined ? data.model : '';
    data.capacity = !(0, isEmpty_1.isEmpty)(data.capacity) && data.capacity !== undefined ? data.capacity : '';
    data.driver = !(0, isEmpty_1.isEmpty)(data.driver) && data.driver !== undefined ? data.driver : '';
    if (validator_1.default.isEmpty(data.plate)) {
        errors.plate = 'Plate  field is required';
    }
    if (validator_1.default.isEmpty(data.driver)) {
        errors.driver = 'Select a  Driver ';
    }
    if (validator_1.default.isEmpty(data.capacity)) {
        errors.capacity = 'Capacity  field is required';
    }
    if (validator_1.default.isEmpty(data.model)) {
        errors.model = 'model field is required';
    }
    return {
        errors: errors,
        isValid: (0, isEmpty_1.isEmpty)(errors)
    };
};
exports.validateTruckInput = validateTruckInput;
