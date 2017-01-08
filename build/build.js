// https://github.com/shelljs/shelljs
require('shelljs/global')
env.NODE_ENV = 'production'

var config = require('../config')
var webpack = require('webpack')
var webpackConfig = require('./webpack.prod.conf')

console.log('building for production...')

rm('-r', config.build.build_dir)

webpack(webpackConfig, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
})
