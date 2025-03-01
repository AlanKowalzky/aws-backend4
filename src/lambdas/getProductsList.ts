import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { productsList } from './products';
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('getProductsList lambda invoked with event:', JSON.stringify(event, null, 2));
  
  try {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(productsList),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};