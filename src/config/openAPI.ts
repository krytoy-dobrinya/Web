import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Web technologies server",
        version: "1.0.0",
        description: "API documentation for my server"
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: ["src/routes/*.ts"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;