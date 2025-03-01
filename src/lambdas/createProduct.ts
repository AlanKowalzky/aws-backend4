import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE = process.env.STOCKS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parsowanie body z JSON
    const requestBody = JSON.parse(event.body || "{}");

    // Walidacja wejściowych danych
    const { title, description, price, count } = requestBody;
    if (!title || !price || count === undefined || count < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid product data" }),
      };
    }

    // Generowanie unikalnego ID dla nowego produktu
    const productId = uuidv4();

    // Tworzenie rekordu produktu
    const product = {
      id: productId,
      title,
      description: description || "",
      price: Number(price),
    };

    // Tworzenie rekordu stocku
    const stock = {
      product_id: productId,
      count: Number(count),
    };

    // Transakcyjna operacja zapisu w DynamoDB
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

    // Zwrot nowo utworzonego produktu jako odpowiedź
    return {
      statusCode: 201,
      body: JSON.stringify({ ...product, count }),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
