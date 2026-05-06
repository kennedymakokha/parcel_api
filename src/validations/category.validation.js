"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategoryInput = void 0;
var validator_1 = require("validator");
var isEmpty_1 = require("../utils/isEmpty");
var validateCategoryInput = function (data) {
    var errors = {};
    data.category_name = !(0, isEmpty_1.isEmpty)(data.category_name) && data.category_name !== undefined ? data.category_name : '';
    data.description = !(0, isEmpty_1.isEmpty)(data.description) && data.description !== undefined ? data.description : '';
    if (validator_1.default.isEmpty(data.category_name)) {
        errors.category_name = 'Name  field is required';
    }
    if (validator_1.default.isEmpty(data.description)) {
        errors.description = 'Name  field is required';
    }
    return {
        errors: errors,
        isValid: (0, isEmpty_1.isEmpty)(errors)
    };
};
exports.validateCategoryInput = validateCategoryInput;
