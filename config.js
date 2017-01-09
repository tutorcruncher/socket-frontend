var path = require('path')

module.exports = {
  build: {
    env: {NODE_ENV: '"production"'},
    build_dir: path.resolve(__dirname, 'dist', process.env.npm_package_version),
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
  },
  test: {
    env: {NODE_ENV: '"testing"'},
  }
}
