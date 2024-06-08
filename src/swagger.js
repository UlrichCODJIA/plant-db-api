const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'PLANTID DB API',
        version: '1.0.0',
        description: 'PlantID Benin is an innovative mobile application that uses computer vision and AI to identify the medicinal plants native to Benin. By providing access to a comprehensive database of traditional and scientific knowledge, PlantID empowers local communities, preserves botanical heritage and stimulates research into medicinal plants.',
    },
    host: process.env.BASE_URL,
};

const options = {
    failOnErrors: true,
    definition: swaggerDefinition,
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
console.log(swaggerSpec);
module.exports = swaggerSpec;