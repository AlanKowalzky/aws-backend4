import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

// Read table names from environment variables
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE = process.env.STOCKS_TABLE!;

// Function that returns list of products
export const handler = async () => {
  try {
    // Get data from Products table
    const products = await dynamoDb
      .scan({ TableName: PRODUCTS_TABLE })
      .promise();
    
    // Get data from Stocks table
    const stocks = await dynamoDb
      .scan({ TableName: STOCKS_TABLE })
      .promise();
    
    // Now combine products and stock information
    const productsWithStock = products.Items?.map((product: any) => {
      const stock = stocks.Items?.find((s: any) => s.product_id === product.id);
      return {
        ...product,
        stock: stock?.count ?? 0,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(productsWithStock),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Błąd podczas pobierania danych' }),
    };
  }
};
