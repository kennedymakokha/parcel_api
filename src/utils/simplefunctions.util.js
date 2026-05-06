"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLocalPhoneNumber = exports.Format_phone_number = void 0;
var Format_phone_number = function (phone_number) {
    var Refined;
    if (phone_number.charAt(0) === "0") {
        var newPhone = phone_number.slice(1);
        Refined = "+254".concat(newPhone);
        return Refined;
    }
    else if (phone_number.substring(0, 4) === "+254") {
        return phone_number;
    }
};
exports.Format_phone_number = Format_phone_number;
var toLocalPhoneNumber = function (phone) {
    if (phone.startsWith('+254')) {
        return '' + phone.slice(1); // Replace +254 with 0
    }
    return phone; // Return as-is if already local
};
exports.toLocalPhoneNumber = toLocalPhoneNumber;
