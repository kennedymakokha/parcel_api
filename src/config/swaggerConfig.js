"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = exports.swaggerUi = void 0;
// src/swagger.ts
var swagger_jsdoc_1 = require("swagger-jsdoc");
var swagger_ui_express_1 = require("swagger-ui-express");
exports.swaggerUi = swagger_ui_express_1.default;
var options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'mtandao apis ',
            version: '1.0.0',
            description: 'api used for  mtandao mobile  app',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // adjust to your folder structure
};
var swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerSpec = swaggerSpec;
