# Expert Institute Assessment API
This project is part of the intervew process at Expert Institute.

I was given the choice to create either a frontend or an API, and I chose to create an API, becuase I am under a time constraint and I have been working on the backend for the past two years.

# Running Locally
```
npm install
node index.js
```

By the time I send this to the team at EI, I will have packaged it into an executable.
Which means that if anyone is reading this, they must have gone back on the earlier commits ;)

# API Endpoints

## GET `/assets`

Lists all asset types

## GET `/assets?limit=int&offset=int`

Lists all asset types, allows user to specify the page size and offset of the response.
For example, `?limit=10&offset=35` will get assets 36-45.


## GET `/users`
Lists all users in the database. Definitely wouldn't want to have this in a production app, but it's useful for this demo.

## GET `/userAssets`
Lists all assets owned by users. Again, this wouldn't be exposed in a real app.

# Limitations
Because of the time constraint, the scope of this project is quite limited.

## Security
I have decided that security is entirely out of scope. Users will, once I add this feature, need to send a user ID with any request to the API, but those IDs will not be secure at all. In a real app like this, especially one dealing with money, security is, of course, hugely important. However, I am under limited time, and security is really hard.

## Database
I'm using a SQLite database for this project. The database is destroyed and re-created every time the app is run. This makes local testing and development much simpler. Also, I am not a DB admin, so my schema and my SQL scripts could probably be better.

## Transactions
A real app like this would have a database table of transactions, but I have decided that such a table is out of scope for this project.

# TODO
* Filter/sort on the `/assets` endpoint
* View asset details (volume, pricing, etc)
* Convert asset value to USD
* Require ruidmentary authentication
* Allow users to add/remove assets from their wallet
* Allow users to get current value in USD of any asset in their wallet
* Allow users to get net gain/loss over period of holding