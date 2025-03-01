import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './../getProductsList';
import { productsList } from '../../mocks/products';

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
  });

  it('should return product list with 200 status code', async () => {
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(productsList);
    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    });
  });

  it('should include CORS headers in the response', async () => {
    const response = await handler(mockEvent);

    expect(response.headers).toMatchObject({
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
    // Mock productsList to throw an error
    jest.mock('../mocks/products', () => {
      throw new Error('Test error');
    });

    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal server error',
    });
    expect(response.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    });
  });
});
