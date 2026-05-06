"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptMessage = exports.encryptMessage = void 0;
var crypto_1 = require("crypto");
var algorithm = "aes-256-cbc";
var secretKey = process.env.ENCRYPT_SECRET || "12345678901234567890123456789012"; // 32 bytes (256 bits)
var ivLength = 16;
var encryptMessage = function (text) {
    var iv = crypto_1.default.randomBytes(ivLength);
    var cipher = crypto_1.default.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    var encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return "".concat(iv.toString("hex"), ":").concat(encrypted.toString("hex"));
};
exports.encryptMessage = encryptMessage;
var decryptMessage = function (encrypted) {
    var _a = encrypted.split(":"), ivHex = _a[0], encryptedHex = _a[1];
    var iv = Buffer.from(ivHex, "hex");
    var encryptedText = Buffer.from(encryptedHex, "hex");
    var decipher = crypto_1.default.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    var decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
exports.decryptMessage = decryptMessage;
