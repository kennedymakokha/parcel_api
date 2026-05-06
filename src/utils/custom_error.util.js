"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
var CustomError = function (validator, body, res) {
    var _a = validator(body), errors = _a.errors, isValid = _a.isValid;
    if (!isValid) {
        var firstError = Object.values(errors)[0];
        res.status(400).json(firstError);
        return false; // <== Tell controller to stop
    }
    return true;
};
exports.CustomError = CustomError;
