import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../createProduct';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid module to get deterministic IDs for testing
jest.mock('uuid');
(uuidv4 as jest.Mock).mockReturnValue('test-uuid-1234');

// Mock the DynamoDB.DocumentClient
jest.mock('aws-sdk', () => {
  const mockTransactWritePromise = jest.fn().mockResolvedValue({});
  const mockTransactWrite = jest.fn().mockReturnValue({
    promise: mockTransactWritePromise,
  });

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        transactWrite: mockTransactWrite,
      })),
    },
  };
});

describe('createProduct Lambda', () => {
  // Reset environment variables before each test
  beforeEach(() => {
    process.env.PRODUCTS_TABLE = 'test-products-table';
    process.env.STOCKS_TABLE = 'test-stocks-table';
    jest.clearAllMocks();
  });

  // Helper function to create a mock event with a product payload
  const createMockEvent = (body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/products',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '',
      apiId: '',
      authorizer: {},
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: '/products',
      stage: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
    },
    resource: '',
  });

  // Test 1: Successfully create a product
  it('should successfully create a product', async () => {
    const validProduct = {
      title: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      count: 10
    };

    const event = createMockEvent(validProduct);
    const response = await handler(event);

    // Check the response
    expect(response.statusCode).toBe(201);
    
    const responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual({
      id: 'test-uuid-1234',
      title: validProduct.title,
      description: validProduct.description,
      price: validProduct.price,
      count: validProduct.count
    });

    // Verify DynamoDB interaction
    const mockDocumentClient = new DynamoDB.DocumentClient();
    expect(mockDocumentClient.transactWrite).toHaveBeenCalledWith({
      TransactItems: [
        {
          Put: {
            TableName: 'test-products-table',
            Item: {
              id: 'test-uuid-1234',
              title: validProduct.title,
              description: validProduct.description,
              price: validProduct.price,
            },
          },
        },
        {
          Put: {
            TableName: 'test-stocks-table',
            Item: {
              product_id: 'test-uuid-1234',
              count: validProduct.count,
            },
          },
        },
      ],
    });
  });

  // Test 2: Creating a product with missing required fields
  it('should return 400 when title is missing', async () => {
    const invalidProduct = {
      // title is missing
      description: 'This is an invalid product',
      price: 99.99,
      count: 10
    };

    const event = createMockEvent(invalidProduct);
    const response = await handler(event);

    // Check the response
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid product data'
    });

    // DynamoDB should not be called
    const mockDocumentClient = new DynamoDB.DocumentClient();
    expect(mockDocumentClient.transactWrite).not.toHaveBeenCalled();
  });

  // Test 3: Creating a product with negative count
  it('should return 400 when count is negative', async () => {
    const invalidProduct = {
      title: 'Test Product',
      description: 'This has a negative count',
      price: 99.99,
      count: -5 // negative count
    };

    const event = createMockEvent(invalidProduct);
    const response = await handler(event);

    // Check the response
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid product data'
    });
  });

  // Test 4: Handling database errors
  it('should return 500 when database operation fails', async () => {
    // Mock the transactWrite to throw an error
    const mockError = new Error('Database error');
    const mockDocumentClient = new DynamoDB.DocumentClient();
    (mockDocumentClient.transactWrite as jest.Mock).mockReturnValueOnce({
      promise: jest.fn().mockRejectedValueOnce(mockError),
    });

    const validProduct = {
      title: 'Test Product',
      description: 'This will fail at DB level',
      price: 99.99,
      count: 10
    };

    const event = createMockEvent(validProduct);
    const response = await handler(event);

    // Check the response
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal Server Error'
    });
  });

  // Test 5: Verify CORS headers are present
  it('should include CORS headers in the response', async () => {
    const validProduct = {
      title: 'CORS Test Product',
      description: 'Testing CORS headers',
      price: 49.99,
      count: 5
    };

    const event = createMockEvent(validProduct);
    const response = await handler(event);

    // Check CORS headers
    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    });
  });

  // Test 6: Default empty description
  it('should set an empty string as default for missing description', async () => {
    const productWithoutDescription = {
      title: 'No Description Product',
      price: 29.99,
      count: 3
      // description is omitted
    };

    const event = createMockEvent(productWithoutDescription);
    const response = await handler(event);

    // Check the response body has empty description
    const responseBody = JSON.parse(response.body);
    expect(responseBody.description).toBe('');

    // Verify the product object sent to DynamoDB has empty description
    const mockDocumentClient = new DynamoDB.DocumentClient();
    const transactWriteCall = (mockDocumentClient.transactWrite as jest.Mock).mock.calls[0][0];
    expect(transactWriteCall.TransactItems[0].Put.Item.description).toBe('');
  });
});