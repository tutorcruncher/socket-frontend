// https://github.com/shelljs/shelljs
let fs = require('fs')
let path = require('path')
require('shelljs/global')
env.NODE_ENV = 'production'

let config = require('../config')
let webpack = require('webpack')
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

  let f = path.join(config.build.build_dir, stats.compilation.outputOptions.filename)
  let build_deets = `\
/* 
  TutorCruncher socket front end, copyright TutorCruncher ltd.
  Released under MIT license, see https://github.com/tutorcruncher/socket-frontend/

 * package version: ${process.env.npm_package_version}
 * build time:      ${new Date()}
 * tag:             ${process.env.TRAVIS_TAG || '-'}
 * branch:          ${process.env.TRAVIS_BRANCH || '-'}
 * commit sha:      ${process.env.TRAVIS_COMMIT || '-'}
*/
`
  fs.readFile(f, 'utf8', function (err, content) {
    if (err) throw err
    content = build_deets + content
    fs.writeFile(f, content, function(err) {
      if (err) throw err
      console.log('\nbuild details inserted into ' + f)
    })
  });
})
