# File changes watcher
# @see https://github.com/gruntjs/grunt-contrib-watch
module.exports =
  server:
    files: ['src/**/*.js', 'test/unit/**/*.js']
    tasks: ['jshint', 'mochaTest:unit']

  grunt:
    files: ['<%= srcDir %>/Gruntfile.coffee', '<%= srcDir %>/grunt/**/*.coffee']
    tasks: ['coffeelint:app']
