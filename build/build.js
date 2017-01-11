// https://github.com/shelljs/shelljs
let fs = require('fs')
let path = require('path')
let webpack = require('webpack')
require('shelljs/global')

env.NODE_ENV = 'production'

let config = require('../config')
let webpackConfig = require('./webpack.prod.conf')

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
  let f = path.join(config.build.build_dir, 'socket.js')
  fs.readFile(f, 'utf8', function (err, content) {
    if (err) throw err
    content = config.build.build_deets + '\n' + content
    fs.writeFile(f, content, function(err) {
      if (err) throw err
      console.log('\nbuild details inserted into ' + f)
    })
  });
})
