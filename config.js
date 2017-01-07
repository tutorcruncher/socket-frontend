var path = require('path')

module.exports = {
  build: {
    env: {NODE_ENV: '"production"'},
    index: path.resolve(__dirname, 'dist/index.html'),
    assetsRoot: path.resolve(__dirname, 'dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/'
  },
  dev: {
    env: {NODE_ENV: '"development"'},
    port: 8000,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},
    cssSourceMap: true
  },
  test: {
    env: {NODE_ENV: '"testing"'},
  }
}
