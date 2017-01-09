var path = require('path')

module.exports = {
  build: {
    env: {NODE_ENV: '"production"'},
    build_dir: path.resolve(__dirname, 'dist', process.env.npm_package_version)
  },
  dev: {
    env: {NODE_ENV: '"development"'},
    port: 8000
  },
  test: {
    env: {NODE_ENV: '"testing"'},
  }
}
