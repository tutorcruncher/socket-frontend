const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function override (config, env) {
  // remove the css loader to simplify things
  config.module.rules[2].oneOf = config.module.rules[2].oneOf.filter(function (l) {
    const test = l.test && l.test.toString()
    return test !== /\.css$/
  })
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  };
  // compile sass, this comes first and compresses css as well as loading sass/scss
  // https://github.com/facebookincubator/create-react-app/issues/2498
  config.module.rules[2].oneOf.splice(0, 0,
    {
      test: /\.(sass|scss|css)$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              outputStyle: 'compressed',
              includePaths: [path.resolve(__dirname, 'node_modules')],
            }
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
  }
  // add another output file at /simple/ and /appointments/
  config.plugins.splice(2, 0,
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, 'public', 'simple/index.html'),
      filename: 'simple/index.html'
    })
  )
  config.plugins.splice(2, 0,
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, 'public', 'appointments/index.html'),
      filename: 'appointments/index.html'
    })
  )
  // console.dir(config, { depth: 10, colors: true })
  return config
}
