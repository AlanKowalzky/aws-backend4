import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './../getProductsById';
import { productsList } from '../../mocks/products';

describe('getProductsById Lambda', () => {
  // Test 1: Successfully retrieve a product
  it('should return a product when valid ID is provided', async () => {
    // Assuming there's at least one product in the productsList
    const testProduct = productsList[0];
    
    const event = {
      pathParameters: {
        productId: testProduct.id
      }
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(testProduct);
  });

  // Test 2: Missing product ID
  it('should return 400 when product ID is not provided', async () => {
    const event = {
      pathParameters: null
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Product ID is required'
    });
  });

  // Test 3: Product not found
  it('should return 404 when product is not found', async () => {
    const event = {
      pathParameters: {
        productId: 'non-existent-id'
      }
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Product not found'
    });
  });

  // Test 4: Verify CORS headers
  it('should include CORS headers in the response', async () => {
    const event = {
      pathParameters: {
        productId: productsList[0].id
      }
    } as APIGatewayProxyEvent;

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

    const event = {
      pathParameters: {
        productId: 'some-id'
      }
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal server error'
    });
  });
});
