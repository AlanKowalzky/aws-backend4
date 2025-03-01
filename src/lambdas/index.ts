import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

// Odczytujemy nazwy tabel z zmiennych środowiskowych
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE = process.env.STOCKS_TABLE!;

// Funkcja, która zwróci listę produktów
export const handler = async () => {
  try {
    // Pobieranie danych z tabeli Products
    const products = await dynamoDb
      .scan({ TableName: PRODUCTS_TABLE })
      .promise();
    
    // Pobieranie danych z tabeli Stocks
    const stocks = await dynamoDb
      .scan({ TableName: STOCKS_TABLE })
      .promise();
    
    // Można teraz połączyć produkty i stany magazynowe
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
