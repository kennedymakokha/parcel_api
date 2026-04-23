// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
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

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
