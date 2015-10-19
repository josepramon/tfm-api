# server side tests (for the dev server and fake API)
module.exports =
  options:
    reporter: 'spec'
    require: './config/require'

  unit:
    src: ['test/unit/**/*.js']

  integration:
    src: ['test/integration/**/*.js']

  functional:
    src: ['test/functional/**/*.js']

  acceptance:
    src: ['test/acceptance/**/*.js']
