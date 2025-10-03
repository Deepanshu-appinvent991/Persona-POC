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
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.persona-poc.com',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.persona-poc.com',
        description: 'Staging server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management'
      },
      {
        name: 'Entities',
        description: 'Entity CRUD operations and management'
      },
      {
        name: 'Step Entity Creation',
        description: 'Step-by-step entity creation process'
      },
      {
        name: 'File Management',
        description: 'File upload, download, and management'
      },
      {
        name: 'Approval Workflow',
        description: 'Entity approval workflow and status management'
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
        },
        StepProgress: {
          type: 'object',
          properties: {
            tempEntityId: {
              type: 'string',
              example: 'temp_entity_1635123456789_abc123def'
            },
            currentStep: {
              type: 'number',
              example: 3
            },
            totalSteps: {
              type: 'number',
              example: 6
            },
            completedSteps: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['basic_info', 'contact_info', 'address_info']
            },
            progress: {
              type: 'number',
              example: 50,
              description: 'Progress percentage'
            },
            nextStep: {
              type: 'number',
              nullable: true,
              example: 4
            },
            entityData: {
              type: 'object',
              description: 'Current entity data'
            }
          }
        },
        FileInfo: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              example: 'document-1635123456789.pdf'
            },
            originalName: {
              type: 'string',
              example: 'contract.pdf'
            },
            type: {
              type: 'string',
              enum: ['PDF', 'IMAGE', 'CSV', 'OTHER'],
              example: 'PDF'
            },
            size: {
              type: 'number',
              example: 1024000
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-10-25T10:30:00.000Z'
            },
            url: {
              type: 'string',
              example: '/uploads/documents/document-1635123456789.pdf'
            }
          }
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            totalDocs: {
              type: 'number',
              example: 100
            },
            limit: {
              type: 'number',
              example: 10
            },
            totalPages: {
              type: 'number',
              example: 10
            },
            page: {
              type: 'number',
              example: 1
            },
            hasPrevPage: {
              type: 'boolean',
              example: false
            },
            hasNextPage: {
              type: 'boolean',
              example: true
            },
            prevPage: {
              type: 'number',
              nullable: true,
              example: null
            },
            nextPage: {
              type: 'number',
              nullable: true,
              example: 2
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
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info .description p { font-size: 14px; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
    `,
    customSiteTitle: 'Persona POC API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'tag',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      operationsSorter: 'alpha'
    }
  }));
  
  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  // Health check endpoint for API documentation
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Persona POC API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      documentation: '/api-docs'
    });
  });
  
  console.log('📚 Swagger documentation available at /api-docs');
  console.log('🔍 API health check available at /api/health');
  console.log('📄 Swagger JSON available at /api-docs.json');
};
