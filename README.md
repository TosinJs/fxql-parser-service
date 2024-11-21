## FXQL Parser Service

## Description

This repository contains the implementation of a Foreign Exchange Query Language (FXQL) Statement Parser built with NestJS and TypeScript. The service is designed to parse and validate FXQL statements, standardize exchange rate information, and store valid entries in a PostgreSQL database. It is a critical component for central federation systems used by Bureau De Change (BDC) operations.

## Features
FXQL Parsing: Extracts and validates currency pairs, buy/sell prices, and transaction caps.
Input Validation: Ensures compliance with FXQL syntax and business rules.
Conflict Resolution: Maintains one entry per currency pair, prioritizing the latest values.
Scalability: Handles up to 1000 currency pairs per request.
Robust API: Provides clear success and error responses.

## Deployment
A live deployment of this application can be found - https://fxql-parser-service.onrender.com/health

## Documentation
The documentation for this application can be found:
Open API - https://fxql-parser-service.onrender.com/api/docs

![OpenAPI Spec](https://github.com/user-attachments/assets/ecd56863-2878-4b7b-b411-32525f0ed2e3)

## Run the Application Locally

### Setup Locally

```bash
# Clone the repository
$ git clone https://github.com/TosinJs/fxql-parser-service

# Install dependencies
$ npm install

# configuration 
# Create .env file in the root folder
$ touch .env

# populate the .env file with your environment variables
$ DATABASE_URL = "your postgresql connection string"

# Database Migrations (The migration files are found in the Prisma folder)
$ npm run prisma-migrate

# Prisma ORM Migration 
$ npm run prisma-generate
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Implementation Details

### API Endpoints
The application exposes the following key endpoints:

<strong>/health (GET):</strong>
This endpoint provides a simple health check to verify if the service is running properly. It returns a 200 OK status with a message indicating the service is healthy, ensuring easy monitoring of the application’s status.

<strong>/fxql-statements (POST):</strong>
This endpoint accepts FXQL statements in the request body. It processes and validates the statements, inserting valid entries into the database. Upon successful parsing, it returns a 200 OK status with a message confirming the operation and details of the parsed exchange rates. If there are validation issues or errors, appropriate error codes and messages are returned to guide the user.

These endpoints cover the core functionality of the application, ensuring both system health monitoring and the processing of FXQL statements.

### Input Validation

<p>This project uses the <strong>class-validator</strong> package to ensure robust input validation for FXQL statements.</p>
<p>The following rules are enforced:</p>
<ul>
  <li><strong>Required Field:</strong> The FXQL field is mandatory and must be present in the request body.</li>
  <li><strong>String Format:</strong> The FXQL field must always be a valid string.</li>
  <li><strong>Strict Validation:</strong> No other data types or unexpected fields are accepted in the input.</li>
</ul>

<p>This approach ensures that only properly formatted FXQL statements are processed, minimizing the risk of invalid or harmful inputs.</p>

### FXQL Parsing

<p>Validates and extracts structured data from FXQL statements.</p>

### Database Structure

The database table `exchange_rates` is designed as follows:  

| **Column**            | **Type**    | **Constraints**                          |  
|-----------------------|-------------|------------------------------------------|  
| `id`                  | `UUID`      | Primary Key, Auto-Generated              |  
| `source_currency`     | `VARCHAR(3)`| Not Null, Uppercase, Length 3            |  
| `destination_currency`| `VARCHAR(3)`| Not Null, Uppercase, Length 3            |     
| `buy_price`           | `DECIMAL`   | Not Null                                 |  
| `sell_price`          | `DECIMAL`   | Not Null                                 |  
| `cap_amount`          | `INTEGER`   | Not Null, Default 0                      |  
| `created_at`          | `TIMESTAMP` | Auto-Generated                           |  

#### Handling Duplicates

A unique constraint exists on the combination of source_currency and destination_currency. If a conflict occurs (i.e., an entry with the same source_currency and destination_currency already exists), the system will automatically update the existing record with the new values. This ensures that the database always reflects the latest FXQL data without creating duplicate entries.

This conflict resolution is implemented using the upsert mechanism <strong>(INSERT ... ON CONFLICT ... DO UPDATE)</strong>, making the process efficient and reliable.

#### Why Prisma is Used in This Project?

Prisma is used in this project as the ORM (Object-Relational Mapping) tool to simplify and enhance database management and interactions. The integration with Typescript also made Prisma a very good choice.

### Error Handling Approach

This project uses a structured error-handling approach to ensure robustness and clarity:
  - <strong>Service-Level Errors:</strong> Internal errors are encapsulated within [custom a service error class](https://github.com/TosinJs/fxql-parser-service/blob/main/src/utils/errorBuilder.utils.ts), providing clear context and isolating them from other layers.<
  - <strong>API-Level Responses:</strong> At the API level, errors are translated into appropriate HTTP status codes, such as 400 for client errors or 500 for server errors, ensuring meaningful responses to clients.
  - <strong>Global Error Handler:</strong> A [global error handler](https://github.com/TosinJs/fxql-parser-service/blob/main/src/utils/exceptions/all-exceptions.exception.ts) is implemented to catch, log and process any both handled and unhandled errors, providing a final layer of defense and maintaining consistent error responses across the application.

This approach ensures errors are properly contained, logged, and communicated without exposing unnecessary details. Specific logs for where errors occured in parsing the FXQL is also added to aid the debugging process.

![FXQL_Parser_Error_Handling](https://github.com/user-attachments/assets/23c7d414-8c3f-4837-b1f7-d134988070a4)

### Rate Limiting

Rate limiting is implemented using the <strong>ThrottlerModule</strong> from NestJS to control the number of requests a client can make within a specified time window. This helps protect the API from abuse and ensures fair usage.

The rate limiting configuration used in this project is:
<ul>
  <li><strong>TTL (Time To Live):</strong> 60000 milliseconds (1 minute)</li>
  <li><strong>Limit:</strong> 10 requests per minute</li>
</ul>

This means that each client can make a maximum of 10 requests per minute. If they exceed this limit, they will receive a 429 Too Many Requests response until the time window resets.

### Deployment

The project is containerized using [Docker](https://github.com/TosinJs/fxql-parser-service/blob/main/Dockerfile) to ensure consistency across environments and simplify deployment. The Docker image is deployed to Render using a [Render.yaml](https://github.com/TosinJs/fxql-parser-service/blob/main/render.yaml) file for config.
