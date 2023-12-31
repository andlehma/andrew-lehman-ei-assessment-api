# Expert Institute Assessment API
This project is part of the intervew process at Expert Institute.

I was given the choice to create either a frontend or an API, and I chose to create an API, becuase I am under a time constraint and I have been working on the backend for the past two years.

# Running Locally
```
npm install
npm run serve
```

API will be live on `localhost:3000` or whatever port is specified in the environment variable `PORT`.

## Testing

`npm run test`

# API Endpoints

## GET `/assets`

Lists all asset types

### Params

* `limit` specifies how many assets to return
* `offset` specifies which asset to start the page on
    * For example, `?limit=10&offset=35` will return assets 36-45.
* `search` allows filtering on the id of the asset
* `sort` specifies which key to sort on
    * defaults to descending, put `-` in front of the parameter for ascending. ex: `?sort=-priceUsd`

## GET `/assets/{{id}}`

Returns details for the specified asset

## GET `/convert/{{id}}`

Converts the specified asset to usd. Provide an `amount` in the query parameters
* ex: `/convert/bitcoin?amount=3.5`

## GET `/users`

Lists all users in the database. Definitely wouldn't want to have this in a production app, but it's useful for this demo.

## POST `/users`

Create a new user. A more robust user creation solution is out of scope for this project.

Expects a body with a user id and a user name:
```json
{
    "id": 3,
    "userName": "Andrew Lehman"
}
```

## GET `/user/{{id}}`

Returns details about the specified user.

## GET `/userAssets`

Lists all assets owned by users. Again, this wouldn't be exposed in a real app.

## GET `/myAssets`

Lists assets owned by the specified user.

Requres an authorization token.

For the purposes of this demo, the authorization token is equivalent to the User ID. In a real application, this would be a secure token which is refreshed periodically and on every login.

Token should be in the form `Bearer {{id}}` and should be passed as an `authorization` header.

## POST `/addAssets`

Requires an authorization token.

Requires a body with an asset ID and an amount
```json
{
    "assetId": "ethereum",
    "amount": 7.89
}
```

To remove assets, provide a negative amount.

## GET `/gainOverTime/{{id}}`

Returns net gain/loss over a period of holding a specified asset.

Expects an `acquired` parameter, e.g. `/gainOverTime/bitcoin?acquired=2018-06-29`. In a real app, we would store the date that the user acquired the asset. That functionality is out of scope for this demo, so this endpoint requires you to specity a date. Format is anything Javascript can parse into a `Date` object.

# Limitations
Because of the time constraint, the scope of this project is quite limited.

## Security
I have decided that security is entirely out of scope. For user-specific tasks, an authorization token is requird, but it's just the User ID, which is not secure at all. In a real app like this, especially one dealing with money, security is, of course, hugely important. However, I am under limited time, and security is really hard.

## Database
I'm using a SQLite database for this project. The database is destroyed and re-created every time the app is run. This makes local testing and development much simpler. Also, I am not a DB admin, so my schema and my SQL scripts could probably be better.

## Transactions
A real app like this would have a database table of transactions, but I have decided that such a table is out of scope for this project.

## Integration Test Data
Currently, the data in the integration tests just lives in a SQL file. I would prefer to populate the test db with generated data using a framework like faker.js
