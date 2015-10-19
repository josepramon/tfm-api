# Coffeescript linter
# @see https://www.npmjs.org/package/grunt-coffeelint
module.exports =
  options:
    configFile: 'coffeelint.json'

  grunt: ['Gruntfile.coffee', 'grunt/*.coffee']
