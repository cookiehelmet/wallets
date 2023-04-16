# Wallet

## Dependencies

Nodejs, NPM, Docker

## Get started

```bash
# Install dependencies
$ npm install

# Run postgres
$ docker-compose up -d

# Create tables and seed data
$ node models/seedData.js

# Start the app
$ node app.js

# Run API tests
$ mocha tests/wallet.test.js

```

## Feature Introduction

In this project, I have implemented a straightforward centralized custodial wallet management system. The seedData.js script populates two user records with hardcoded access tokens. In the real world, authentication can be done via third-party auth providers, along with session and access token management.

The wallet implementation is quite simple. A user can create wallets by invoking the POST /wallets endpoint and can view wallet balances with the GET /wallets endpoint. Additionally, users can fund wallets and transfer funds between wallets.

Signing messages is accomplished through the POST /wallets/:id/sign endpoint. For simplicity, it performs a jwt.sign using a symmetric signing method with the wallet ID as the secret key.

You can find more examples in tests/wallet.test.js.