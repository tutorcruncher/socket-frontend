const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

module.exports = function override (config, env) {
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
    config.output.filename =  'static/socket.js'
    config.output.chunkFilename =  'static/socket.[chunkhash:8].chunk.js'
    if (process.env.ANALYSE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'report.html',
        })
      )
    }
  }
  // console.dir(config, { depth: 10, colors: true })
  return config
}
