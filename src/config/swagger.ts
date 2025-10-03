import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Persona POC API',
      version: '1.0.0',
      description: 'A comprehensive entity management system with approval workflows',
      contact: {
        name: 'API Support',
        email: 'support@persona-poc.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Unique username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            role: {
              type: 'string',
              enum: ['USER', 'APPROVER', 'ADMIN'],
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              description: 'User active status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Entity: {
          type: 'object',
          required: ['name', 'identificationNumber', 'email', 'address'],
          properties: {
            id: {
              type: 'string',
              description: 'Entity ID'
            },
            name: {
              type: 'string',
              description: 'Entity name'
            },
            identificationNumber: {
              type: 'string',
              description: 'Unique identification number'
            },
            inquiryId: {
              type: 'string',
              description: 'Auto-generated inquiry ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Entity email address'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date'
            },
            address: {
              $ref: '#/components/schemas/Address'
            },
            profilePhoto: {
              $ref: '#/components/schemas/Document'
            },
            documents: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Document'
              }
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'],
              description: 'Entity status'
            },
            approvalNotes: {
              type: 'string',
              description: 'Approval notes'
            },
            rejectionReason: {
              type: 'string',
              description: 'Rejection reason'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Address: {
          type: 'object',
          required: ['street', 'city', 'state', 'country', 'postalCode'],
          properties: {
            street: {
              type: 'string',
              description: 'Street address'
            },
            city: {
              type: 'string',
              description: 'City'
            },
            state: {
              type: 'string',
              description: 'State/Province'
            },
            country: {
              type: 'string',
              description: 'Country'
            },
            postalCode: {
              type: 'string',
              description: 'Postal/ZIP code'
            }
          }
        },
        Document: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['PDF', 'IMAGE', 'CSV', 'OTHER'],
              description: 'Document type'
            },
            filename: {
              type: 'string',
              description: 'File name'
            },
            originalName: {
              type: 'string',
              description: 'Original file name'
            },
            mimeType: {
              type: 'string',
              description: 'MIME type'
            },
            size: {
              type: 'number',
              description: 'File size in bytes'
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Persona POC API Documentation'
  }));
  
  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('📚 Swagger documentation available at /api-docs');
};
