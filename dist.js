// https://github.com/shelljs/shelljs
const fs = require('fs')
const path = require('path')
require('shelljs/global')

let prod_build_dir = null
let version = `${process.env.npm_package_version}-${process.env.TRAVIS_COMMIT}`
if (process.env.TRAVIS_TAG) {
  console.log(`detected TRAVIS_TAG "${process.env.TRAVIS_TAG}", building for release deploy.`)
  if (process.env.TRAVIS_TAG !== process.env.npm_package_version) {
    throw `TRAVIS_TAG contradicts npm_package_version: ${process.env.TRAVIS_TAG} vs ${process.env.npm_package_version}`
  }
  prod_build_dir = path.resolve(__dirname, 'dist', process.env.npm_package_version)
  env.PUBLIC_URL = 'https://cdn.tutorcruncher.com/socket/' + process.env.npm_package_version + '/'
  version = process.env.npm_package_version
} else if (process.env.TRAVIS_BRANCH) {
  console.log('no tag detected but on branch, building to dev/branch/')
  prod_build_dir = path.resolve(__dirname, 'dist', 'dev', process.env.TRAVIS_BRANCH || '')
  env.PUBLIC_URL = 'https://cdn.tutorcruncher.com/socket/dev/' + process.env.TRAVIS_BRANCH + '/'
} else if (process.env.TRAVIS_COMMIT)  {
  console.log('no tag or branch detected, building to dev/')
  prod_build_dir = path.resolve(__dirname, 'dist', 'dev')
  env.PUBLIC_URL = 'https://cdn.tutorcruncher.com/socket/dev/'
} else {
  console.log('no tag, branch or commit detected, assuming on netlify')
  version = process.env.npm_package_version
  env.PUBLIC_URL = '/'
}
console.log(`build directory: "${prod_build_dir}"`)
env.REACT_APP_RELEASE = version

const build_deets = `\
/* 
  TutorCruncher socket frontend, Copyright (c) 2017 TutorCruncher ltd.
  Released under the MIT license, see https://github.com/tutorcruncher/socket-frontend/

 * version:    ${version}
 * build time: ${new Date()}
 * tag:        ${process.env.TRAVIS_TAG || '-'}
 * branch:     ${process.env.TRAVIS_BRANCH || '-'}
 * commit sha: ${process.env.TRAVIS_COMMIT || '-'}
*/`

// remove the entire ./dist and ./build directory to avoid confusion
rm('-r', path.resolve(__dirname, 'dist'))
rm('-r', path.resolve(__dirname, 'build'))

if (exec('yarn build').code !== 0) {
  console.log('error running "yarn build"')
  exit(1)
}

if (prod_build_dir) {
  mkdir('-p', prod_build_dir)
  cp(path.resolve(__dirname, 'build/static/*'), prod_build_dir)
  let f = path.join(prod_build_dir, 'socket.js')
  fs.readFile(f, 'utf8', function (err, content) {
    if (err) throw err
    content = build_deets + '\n' + content
    fs.writeFile(f, content, function (err) {
      if (err) throw err
      console.log('\nbuild details inserted into ' + f)
    })
  })
}
