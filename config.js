var path = require('path')

if (process.env['TRAVIS_TAG'] !== undefined) {
  console.log('detected TRAVIS_TAG')
  var prod_build_dir = path.resolve(__dirname, 'dist', process.env.npm_package_version)
  var prod_public_path = 'https://cdn.tutorcruncher.com/socket/' + process.env.npm_package_version + '/'
} else {
  var prod_build_dir = path.resolve(__dirname, 'dist', 'dev', process.env.npm_package_version)
  var prod_public_path = 'https://cdn.tutorcruncher.com/socket/dev/' + process.env.npm_package_version + '/'
}

module.exports = {
  build: {
    env: {NODE_ENV: '"production"'},
    build_dir: prod_build_dir,
    public_path: prod_public_path,
    css_source_map: false,
    build_deets: `\
/* 
  TutorCruncher socket frontend, Copyright (c) 2017 TutorCruncher ltd.
  Released under the MIT license, see https://github.com/tutorcruncher/socket-frontend/

 * package version: ${process.env.npm_package_version}
 * build time:      ${new Date()}
 * tag:             ${process.env.TRAVIS_TAG || '-'}
 * branch:          ${process.env.TRAVIS_BRANCH || '-'}
 * commit sha:      ${process.env.TRAVIS_COMMIT || '-'}
*/`,
  },
  dev: {
    env: {NODE_ENV: '"development"'},
    port: 8000,
    build_dir: path.resolve(__dirname, 'dev'),
    css_source_map: true,
    public_path: '/',
  },
  test: {
    env: {NODE_ENV: '"testing"'},
    build_dir: path.resolve(__dirname, 'dist-test'),
    css_source_map: true,
    public_path: '/',
  }
}
