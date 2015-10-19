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
    - Run `grunt mongo:setup` to create the data and logs directories and the PID file, and set the propper permissions. *This is optional, see the README.md file inside the db directory*.
    - Start Mongo by executing `grunt mongo`.
    - Run `grunt mongo:populate` to load the fake data.
    - Run `grunt mongo:stop` to stop mongo (the grunt tasks will start/stop it when needed).


## Usage:

The gruntfile has 2 primary tasks, the default one and one called *dev*.

The default one starts a simple HTTP server to serve the API.

The *dev* task does the same as the default one, and does some additional things:

- It starts the mongo server used by the API and redis used to cache stuff (like the JWT).
- It monitors the server files, so whenever changed, the files are linted, tested and the server is restarted.
