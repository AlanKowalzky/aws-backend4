import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../getProductsById';
import { productsList } from '../../mocks/products';

describe('getProductsById Lambda', () => {
  // Helper function to create a complete mock event
  const createMockEvent = (pathParameters: { productId: string } | null): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/products',
    pathParameters,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '',
      apiId: '',
      authorizer: {},
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
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

  // Test 1: Successfully retrieve a product
  it('should return a product when valid ID is provided', async () => {
    const testProduct = productsList[0];
    const event = createMockEvent({ productId: testProduct.id });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(testProduct);
  });

  // Test 2: Missing product ID
  it('should return 400 when product ID is not provided', async () => {
    const event = createMockEvent(null);

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Product ID is required'
    });
  });

  // Test 3: Product not found
  it('should return 404 when product is not found', async () => {
    const event = createMockEvent({ productId: 'non-existent-id' });

    const response = await handler(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Product not found'
    });
  });

  // Test 4: Verify CORS headers
  it('should include CORS headers in the response', async () => {
    const testProduct = productsList[0];
    const event = createMockEvent({ productId: testProduct.id });

    const response = await handler(event);

    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    });
  });

  // Test 5: Error handling
  it('should return 500 when an error occurs', async () => {
    // Mock productsList.find to throw an error
    jest.spyOn(productsList, 'find').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const event = createMockEvent({ productId: 'some-id' });

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal server error'
    });
  });
});
