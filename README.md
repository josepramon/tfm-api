# API server

[![Build Status](https://magnum.travis-ci.com/josepramon/tfm-api.svg?token=GtvmH1UiAg21rsbqB2WR)](https://magnum.travis-ci.com/josepramon/tfm-api)


## Prerequisites:

To run the API, the following components are required:

- node & npm
- mongo
- redis


## Setup:

- Install dependencies executing: `npm install`
- Mongo:
    - Run `grunt mongo:setup` to create the data and logs directories and the PID file, and set the proper permissions. *This is optional, see the README.md file inside the db directory*.
    - Start Mongo by executing `grunt mongo`.
- Create a file called `env.json` and override any of the settings defined in `env.default.json`. This file contains some application parameters that should be configured, like Mongo, Redis, and mail parameters.
- With Mongo running, execute `grunt setup` to load some required data into Mongo, create some needed files, etc.
- Execute `grunt` to start the server.


### Database settings:

Database settings should be configured in `env.json`. See `env.default.json` for available options. The API uses redis to store temporary data, and mongo for persistent data.

On the default environment file, there are defined two mongo settings sets:

- **default**: Is the database used normally by the application.
- **test**: Used while executing the tests, so the regular data is not wiped out.

### Mail settings:

Mail settings should be configured in `env.json`. Mail sending is handled by the [Nodemailer library](http://nodemailer.com/). The configuration should be something like:

```json
{
  "mail": {
    "service": "Gmail",
    "auth": {
        "user": "sender@gmail.com",
        "pass": "password"
    },
    "sender": "Some name <sender@gmail.com"
  }
}
```

Nodemailer supports various services. See the full list [here](https://github.com/andris9/nodemailer-wellknown#supported-services).  

It's also possible to setup a regular SMTP connection, with a configuration like:

```json
{
  "mail": {
    "host": "localhost",
    "port": 25,
    "auth": {
        "user": "username",
        "pass": "password"
    },
    "sender": "Some name <sender@gmail.com"
  }
}
```

**Warning**: some services are really tricky to setup (for example, Gmail).

In my tests, i've found the easiest way to setup this is creating a free account on [Sendgrid](http://sendgrid.com) and then create an API key [here](https://sendgrid.com/docs/Classroom/Send/api_keys.html).  
The config should be something like:

```json
{
  "mail": {
    "service": "sendgrid",
    "auth": {
        "api_key": "your_api_key"
    },
    "sender": "Some name <sender@gmail.com"
  }
}
```


The `sender` field is the default sender for all the mails originating from the API.


## Usage:

To start the API in *production mode*, un `npm start`. To stop it, `npm stop`.

To start the API in *development mode*, use one of the gunt tasks. In development mode, logs are written to *stdout* and the application files are *watched*, so if anything changes the app is automatically restarted.

The gruntfile has 2 primary tasks, the default one and one called *dev*.

The default one starts a simple HTTP server to serve the API.

The *dev* task does the same as the default one, and does some additional things:

- It starts the mongo server used by the API and redis used to cache stuff (like the JWT).
- It monitors the server files, so whenever changed, the files are linted, tested and the server is restarted.
