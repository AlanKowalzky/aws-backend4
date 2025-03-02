import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE = process.env.STOCKS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse body from JSON
    const requestBody = JSON.parse(event.body || "{}");

    // Validate input data
    const { title, description, price, count } = requestBody;
    if (!title || !price || count === undefined || count < 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: "Invalid product data" }),
      };
    }

    // Generate unique ID for the new product
    const productId = uuidv4();

    // Create product record
    const product = {
      id: productId,
      title,
      description: description || "",
      price: Number(price),
    };

    // Create stock record
    const stock = {
      product_id: productId,
      count: Number(count),
    };

    // Transaction write operation to DynamoDB
    await dynamoDB
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: PRODUCTS_TABLE,
              Item: product,
            },
          },
          {
            Put: {
              TableName: STOCKS_TABLE,
              Item: stock,
            },
          },
        ],
      })
      .promise();

    // Return the newly created product as response
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ ...product, count }),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};