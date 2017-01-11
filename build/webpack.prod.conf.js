var path = require('path')
var config = require('../config')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')

var env = process.env.NODE_ENV === 'testing' ? config.test.env : config.build.env

module.exports = merge(baseWebpackConfig, {
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({'process.env': env}),
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
})
