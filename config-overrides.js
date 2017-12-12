module.exports = function override (config, env) {
  config.module.rules[1].oneOf.splice(config.module.rules[1].oneOf.length - 1, 0,
    {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
    },
  )
  if (env === 'production') {
    config.output.filename =  'static/socket.js'
    config.output.chunkFilename =  'static/socket.[chunkhash:8].chunk.js'
  }
  // console.dir(config, { depth: 10, colors: true })
  return config
}
