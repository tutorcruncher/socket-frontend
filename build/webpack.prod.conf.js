var path = require('path')
var config = require('../config')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')

if (process.env.NODE_ENV === 'testing') {
  var index_filename = 'index.html'
  var env = config.test.env
} else {
  var index_filename = path.join(config.build.build_dir, 'index.html')
  var env = config.build.env
}

var webpackConfig = merge(baseWebpackConfig, {
  // TODO add version to output dir
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({'process.env': env}),
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: index_filename,
      template: 'index.html',
      inject: true
    })
  ]
})

module.exports = webpackConfig
