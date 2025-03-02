import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tworzymy tabele DynamoDB
    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'products',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Usuwanie tabeli przy usunięciu stacka (tylko na etapie developmentu)
    });

    const stocksTable = new dynamodb.Table(this, 'StocksTable', {
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      tableName: 'stocks',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Usuwanie tabeli przy usunięciu stacka (tylko na etapie developmentu)
    });

    // Tworzymy funkcję Lambda
    const productLambda = new lambda.Function(this, 'ProductLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'), // Ścieżka do skompilowanej aplikacji Lambda (np. dist/)
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,  // Przekazanie nazwy tabeli Products do zmiennej środowiskowej
        STOCKS_TABLE: stocksTable.tableName,     // Przekazanie nazwy tabeli Stocks do zmiennej środowiskowej
      },
    });

    // Udzielamy funkcji Lambda uprawnień do odczytu/zapisu w tabelach DynamoDB
    productsTable.grantReadWriteData(productLambda);
    stocksTable.grantReadWriteData(productLambda);

    // Tworzymy API Gateway i podpinamy Lambdę
    const api = new apigateway.LambdaRestApi(this, 'ProductApi', {
      handler: productLambda,
      proxy: true,
    });

    new cdk.CfnOutput(this, 'API URL', {
      value: api.url ?? 'Brak URL',
    });
  }
}
