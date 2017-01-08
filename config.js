var path = require('path')

module.exports = {
  build: {
    env: {NODE_ENV: '"production"'},
    build_dir: path.resolve(__dirname, 'dist')
  },
  dev: {
    env: {NODE_ENV: '"development"'},
    port: 8000
  },
  test: {
    env: {NODE_ENV: '"testing"'},
  }
}
