# Nodemon
# @see https://github.com/ChrisWren/grunt-nodemon
module.exports =

  TFM_API_dev:
    script: './src/app.js'
    options:
      args: ['dev']
      nodeArgs: ['--debug']
      watch: ['./src']
      callback: (nodemon) ->
        nodemon.on "log", (event) ->
          console.log event.colour
          return
      env:
        PORT: '<%= serverPort %>'
        DEBUG: 'ApiApp:*'

  TFM_API_production:
    script: './src/app.js'
    options:
      watch: ['./src']
      callback: (nodemon) ->
        nodemon.on "log", (event) ->
          console.log event.colour
          return
      env:
        PORT: '<%= serverPort %>'
