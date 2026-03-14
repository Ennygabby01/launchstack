import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Docs',
      version: '1.0.0',
      description: 'Auto-generated API documentation',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.js'],
};

const spec = swaggerJsdoc(options);

/**
 * Register Swagger UI on an Express app.
 * Usage: app.use('/api-docs', ...swagger());
 */
export function swagger() {
  return [swaggerUi.serve, swaggerUi.setup(spec)];
}

export { spec };
