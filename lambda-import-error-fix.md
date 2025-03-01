# Lambda Import Error Fix

## Problem
The Lambda functions are failing with the error:
```
Error: Cannot find module '../mocks/products'
Require stack:
- /var/task/getProductsList.js
- /var/runtime/index.mjs
```

## Analysis
1. The Lambda code in `src/lambdas/getProductsList.ts` and `src/lambdas/getProductsById.ts` has been updated to import from `./products` instead of `../mocks/products`.
2. The build script (`scripts/build.sh`) has been updated to copy the mock files into the lambdas directory with:
   ```bash
   cp -r dist/mocks/*.js dist/lambdas/
   ```

However, the error message shows that the Lambda functions are still trying to import from `../mocks/products`, which suggests that:
1. The updated code hasn't been properly deployed, or
2. There might be caching issues, or
3. The TypeScript compilation process isn't including the latest changes.

## Solution
To fix this issue, ensure that:

1. You've run the build script after making changes to the TypeScript files:
   ```bash
   ./scripts/build.sh
   ```

2. The compiled JavaScript files in `dist/lambdas/` have the correct import statement:
   ```javascript
   // Check that this now says:
   const { productsList } = require('./products');
   // NOT:
   const { productsList } = require('../mocks/products');
   ```

3. You've properly deployed the updated Lambda code to AWS:
   ```bash
   # Example deployment command (adjust based on your deployment method)
   aws lambda update-function-code --function-name YourFunctionName --zip-file fileb://path/to/deployment/package.zip
   ```

4. If you're using AWS CDK or SAM for deployment, make sure to run the appropriate deploy commands:
   ```bash
   # For CDK
   cdk deploy

   # For SAM
   sam deploy
   ```

5. Clear any potential caching issues by:
   - Publishing a new version of the Lambda function
   - Updating the Lambda configuration (even a simple change like updating a description can help)
   - Creating a new deployment package with a different name

The changes made to the code and build script are correct, but they need to be properly built and deployed to take effect.