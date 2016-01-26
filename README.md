# Mosaiqo Helpdesk API server

[![Build Status](https://magnum.travis-ci.com/josepramon/tfm-api.svg?token=GtvmH1UiAg21rsbqB2WR)](https://magnum.travis-ci.com/josepramon/tfm-api)

Part of the Mosaiqo Helpdesk system, developed as my [final project](http://hdl.handle.net/10609/45241) for the _[Multimedia applications: design and development of smart content](http://estudis.uoc.edu/ca/masters-universitaris/aplicacions-multimedia/)_ Master's degree at Universitat Oberta de Catalunya.

The project consists on the design and development of a web based help desk, using modern methodologies and architectures in web development, such as Single Page Applications, RESTful APIs, Node.js and NoSQL databases, implemented using new languages as CoffeeScript, Stylus or ES6, prioritizing the usability and performance of all the components of the system to provide an optimal experience on any kind of devices.

Warning: This is the first realease of the project, so it may not be ready fot production.


## Prerequisites:

To run the API, the following components are required:

- node 4.2 & npm
- mongo
- redis


## Setup:

- Install dependencies executing: `npm install`. On some linux systems, some dependencies must be installed first:

```
apt-get install -y build-essential openssl libssl-dev pkg-config
apt-get install -y python-software-properties python g++ make
apt-get install -y libkrb5-dev
```

- Mongo (optional):
    - Run `grunt mongo:setup` to create the data and logs directories and the PID file, and set the proper permissions. *This is optional, see the README.md file inside the db directory*.
    - Start Mongo by executing `grunt mongo`.
- Create a file called `env.json` and override any of the settings defined in `env.default.json`. This file contains some application parameters that should be configured, like Mongo, Redis, and mail parameters.
- With Mongo running, execute `grunt setup` to load some required data into Mongo, create some needed files, etc.
- Execute `npm start` to start the server.


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


## Uploads settings:

File uploads can be stored locally or in Amazon S3. The configuration for local uploads, defined in `env.json`, should be something like

```
{
  "uploads": {
    "mode":  "local",
    "dest":  "/path/to/the/upload/dir",
    "host":  "localhost:9999",
    "path":  "uploads",
    "host":  null
  }
}
```

where:

- *dest*: the destination directory where the files will be stored
- *host*: host that will serve the files.  
  On production, the files should not be served by the API, it's better to serve directly form Nginx (or Apache or whatever).  
  On development mode, this can be set to null, and the API will serve the files from the path defined in the key 'path'.
- *path*: url path from where the images will be served.

So, for example, with the previous configuration, an uploaded file  `whatever.jpg` will be available at `http://localhost/uploads/whatever.jpg`.

For S3 uploads, the configuration should be something like:

```
 {
  "uploads": {
    "mode":        "s3",
    "path":        "uploads",
    "host":        "your-bucket.s3.amazonaws.com"
    "bucket":      "the-bucket-name",
    "region":      "eu-central-1"
  },
  "s3": {
    "accessKey":   "your-S3-accessKey",
    "accessKeyId": "your-S3-accessKeyId"
  }
 }
```

where:

- *uploads.path*: 'directory' for the file.
- *uploads.host*: host used to access the files (not used for the upload progress but in order to retrieve later the files). Set the value to `your-bucket.3.amazonaws.com` or to your custom domain (requires a CNAME DNS record pointing to AWS, see the [Amazon docs](http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html))
- *uploads.bucket*: S3 bucket that will store the file uploads.

and

- *s3.accessKey*: S3 access key
- *s3.accessKeyId*: S3 access key id
- *uploads.region*: AWS region where the buckets are located.

The _bucket_, _region_ and _host_ keys are defined inside the _uploads_ node instead of the generic _s3_ one so diferent S3 buckets/configurations can be used for diferent purposes.


## Usage:

To start the API in *production mode*, run `npm start`.

To start the API in *development mode*, use one of the grunt tasks. In development mode, logs are written to *stdout* and the application files are *watched*, so if anything changes the app is automatically restarted.

The gruntfile has 2 primary tasks, the default one and one called *dev*.

The default one starts a simple HTTP server to serve the API.

The *dev* task does the same as the default one, and does some additional things:

- It starts the mongo server used by the API and redis used to cache stuff (like the JWT).
- It monitors the server files, so whenever changed, the files are linted, tested and the server is restarted.

## Initial administrator creation:

Run `node ./util/createUser.js` to create the initial administrator. This script can also be used to create agents and regular users (only for testing purposes, regular users and agents should be registered in with the apps).
