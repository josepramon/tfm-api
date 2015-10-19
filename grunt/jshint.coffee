module.exports =
  options:
    reporter: require('jshint-stylish')
    jshintrc: true
  all: ['src/**/*.js', 'util/**/*.js', 'test/**/*.js', '!test/coverage/**/*.js']
