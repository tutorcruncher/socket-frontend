var path = require('path')

var prod_build_dir, prod_public_path, version
if (process.env.TRAVIS_TAG) {
  console.log(`detected TRAVIS_TAG "${process.env.TRAVIS_TAG}", building for release deploy.`)
  if (process.env.TRAVIS_TAG !== process.env.npm_package_version) {
    throw `travis tag doesn't match npm_pckage_version: ${process.env.TRAVIS_TAG} vs ${process.env.npm_package_version}`
  }
  prod_build_dir = path.resolve(__dirname, 'dist', process.env.npm_package_version)
  prod_public_path = 'https://cdn.tutorcruncher.com/socket/' + process.env.npm_package_version + '/'
  version = `${process.env.npm_package_version}`
} else {
  console.log('no tag detected, building to dev > branch')
  prod_build_dir = path.resolve(__dirname, 'dist', 'dev', process.env.TRAVIS_BRANCH || '')
  prod_public_path = 'https://cdn.tutorcruncher.com/socket/dev/' + process.env.npm_package_version + '/'
  version = `${process.env.npm_package_version}-${process.env.TRAVIS_COMMIT}`
}
console.log(`build directory: "${prod_build_dir}"`)

module.exports = {
  build: {
    env: {
      NODE_ENV: '"production"',
      RELEASE: `"${version}"`,
      SOCKET_API_URL: '"https://socket.tutorcruncher.com"',
    },
    build_dir: prod_build_dir,
    public_path: prod_public_path,
    css_source_map: false,
    build_deets: `\
/* 
  TutorCruncher socket frontend, Copyright (c) 2017 TutorCruncher ltd.
  Released under the MIT license, see https://github.com/tutorcruncher/socket-frontend/

 * version:    ${version}
 * build time: ${new Date()}
 * tag:        ${process.env.TRAVIS_TAG || '-'}
 * branch:     ${process.env.TRAVIS_BRANCH || '-'}
 * commit sha: ${process.env.TRAVIS_COMMIT || '-'}
*/`,
  },
  dev: {
    env: {
      NODE_ENV: '"development"',
      RELEASE: '"development"',
      // SOCKET_API_URL: '"api/"',
      SOCKET_API_URL: '"https://socket.tutorcruncher.com"',
    },
    port: 5000,
    build_dir: path.resolve(__dirname, 'dev'),
    css_source_map: true,
    public_path: '/',
  },
  test: {
    env: {
      NODE_ENV: '"testing"',
      RELEASE: '"testing"',
      SOCKET_API_URL: '""',
    },
    build_dir: path.resolve(__dirname, 'dist-test'),
    css_source_map: true,
    public_path: '/',
  }
}
