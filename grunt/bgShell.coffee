# https://www.npmjs.org/package/grunt-bg-shell
module.exports = (grunt) ->
  _defaults:
    bg: true

  # nodemon
  nodemonDev:
    cmd: 'grunt nodemon:TFM_API_dev'

  nodemonDev_stop:
    cmd: 'ps aux | grep "nodemon:TFM_API_dev" | grep -v grep | awk \'{print $2}\' | xargs kill'
    bg: false

  nodemonProd:
    cmd: 'grunt nodemon:TFM_API_production'

  nodemonProd_stop:
    cmd: 'ps aux | grep "nodemon:TFM_API_production" | grep -v grep | awk \'{print $2}\' | xargs kill'
    bg: false


  # mongo
  mongod_start:
    cmd: 'mongod --config ./db/mongo/conf/mongodb.conf'

  mongod_stop:
    cmd: 'cat db/mongo/pid | xargs kill'
    bg: false

  mongod_setup:
    cmd: 'mkdir data && mkdir log && touch log/mongodb.log'
    execOpts:
      cwd: './db/mongo'
    bg: false

  mongod_populate:
    cmd: 'node ./util/populateDB.js'
    bg: false


  # redis
  redis_start:
    cmd: 'redis-server db/redis/redis.conf'

  redis_stop:
    cmd: 'cat db/redis/pid | xargs kill'
    bg: false


  # utils
  createUser:
    bg: false
    cmd: 'node ./util/createUser.js ' + ( if grunt.option('default') then '--default' else '')
