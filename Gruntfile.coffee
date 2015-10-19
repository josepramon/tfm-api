module.exports = (grunt) ->

  _ = require('lodash')


  # Defaults:
  # ================================================================
  defaults =
    # 'secret' used to sign the JWT
    jwtSecret: 'my_random_and_uber_secret_string_to_sign_the_json_web_tokens'

    # Redis settings
    redis:
      host: 'localhost'
      port: 6379

    # Mongo settings
    mongo:
      host:     'localhost'
      port:     27017
      user:     null
      password: null
      database: 'tfmAPI'


  # The defaults can be overrided so you can place the frontendApp wherever you
  # want, or to use a redis or mongo running on another machine.
  #
  # Just create a file called 'env.json' at the project root and overwrite any
  # default settings you want
  #
  envConfigFile = 'env.json'

  if grunt.file.exists envConfigFile
    envConfig = grunt.file.readJSON(envConfigFile)
  else
    envConfig = {}

  config = _.defaults envConfig, defaults



  # Actual tasks config...
  # ================================================================

  # Data available to the tasks:
  # The previous config plus some aditional params.
   config = _.extend config,

    # Directories:
    rootDir:      __dirname
    srcDir:       './src'
    docsDir:      'docs'

    # Dev. server settings:
    serverPort:         9000

    banner: '/*! <%= package.name %> <%= package.version %> |
 © <%= package.author %> - All rights reserved |
 <%= package.homepage %> */\n'


  # Autoloading for the grunt tasks, jitGrunt enables loading them on demand
  require('load-grunt-config') grunt,
    jitGrunt: true
    data: config


  # Display the elapsed execution time of grunt tasks
  require('time-grunt') grunt


  # Load explicitly the notify tasks,
  # otherwise, no notifications will be fired or errors
  grunt.loadNpmTasks('grunt-notify')

  # Load explicitly the istanbul tasks,
  # because istanbul exposes more tasks like 'instrument' and others
  # that are not recognised otherwise by jitGrunt
  grunt.loadNpmTasks('grunt-istanbul')

  # Override some istanbul stuff because it does not support ES6
  istanbulHarmony = require('istanbul-harmony')

  usedIstanbul = undefined
  Instrumenter = undefined

  grunt.registerTask 'istanbul:override', ->
    usedIstanbul = require('grunt-istanbul/node_modules/istanbul')
    Instrumenter = usedIstanbul.Instrumenter
    # Overrides `Instrumenter`
    usedIstanbul.Instrumenter = istanbulHarmony.Instrumenter
    return

  grunt.registerTask 'istanbul:restore', ->
    # Restores original `Instrumenter`
    usedIstanbul.Instrumenter = Instrumenter
    return
