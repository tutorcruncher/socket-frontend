const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function override (config, env) {
  // compile sass
  // https://github.com/facebookincubator/create-react-app/issues/2498
  config.module.rules[1].oneOf.splice(config.module.rules[1].oneOf.length - 1, 0,
    {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed'
            }
          }
        ]
    },
  )
  if (env === 'production') {
    // set the output filename to just socket.js
    config.output.filename =  'static/socket.js'
    config.output.chunkFilename =  'static/socket.[chunkhash:8].chunk.js'

    // if run with `ANALYSE=1 yarn build` create report.js size report
    if (process.env.ANALYSE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'report.html',
        })
      )
    }
  } else {
    // add another output file at localhost:3000/foobar/
    config.plugins.splice(2, 0,
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, 'public', 'index.html'),
        filename: 'foobar/index.html'
      })
    )
  }
  // console.dir(config, { depth: 10, colors: true })
  return config
}
