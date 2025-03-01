import { APIGatewayProxyEvent } from 'aws-lambda';

// Define Product interface
interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  count: number;
}

// First declare the mock variable with 'mock' prefix
const mockProductsList: Product[] = [];

// Then do the imports
import { handler } from './../getProductsList';

// Then the jest.mock call
jest.mock('../../mocks/products', () => ({
  productsList: () => mockProductsList
}));

describe('getProductsList lambda', () => {
  let mockEvent: APIGatewayProxyEvent;

  beforeEach(() => {
    // Reset the mock event before each test
    mockEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/products',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the module between tests
    jest.resetModules();
  });

  it('should return product list with 200 status code', async () => {
    const response = await handler(mockEvent);

    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    
    // Ensure we have a response with the correct structure
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        }
      })
    );

    // If body is present, verify it's an empty array
    if (response.body) {
      const parsedBody = JSON.parse(response.body);
      expect(parsedBody).toEqual([]);
    }
  });

  it('should include CORS headers in the response', async () => {
    const response = await handler(mockEvent);

    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    });
  });

  it('should log the event when invoked', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await handler(mockEvent);

    expect(consoleSpy).toHaveBeenCalledWith(
      'getProductsList lambda invoked with event:',
      JSON.stringify(mockEvent, null, 2)
    );

    consoleSpy.mockRestore();
  });

  it('should handle errors and return 500 status code', async () => {
    // Mock the entire module for this test
    jest.mock('../../mocks/products', () => ({
      get productsList() {
        throw new Error('Test error');
      }
    }));

    // Need to re-import the handler to use the new mock
    const { handler } = require('./../getProductsList');
    
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(500);
    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    });
  });
});
