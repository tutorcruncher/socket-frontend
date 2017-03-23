var path = require('path')
var config = require('../config')
var projectRoot = path.resolve(__dirname, '../')

var current_conf = config.build
if (process.env.NODE_ENV === 'testing') {
  current_conf = config.test
} else if (process.env.NODE_ENV === 'development') {
  current_conf = config.dev
}

module.exports = {
  entry: {
    socket: './src/main.js'
  },
  output: {
    path:  path.resolve(current_conf.build_dir),
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    publicPath: current_conf.public_path,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.vue', '.scss'],
    fallback: [path.join(__dirname, '../node_modules')],
    alias: {
      'src': path.resolve(__dirname, '../src'),
      'components': path.resolve(__dirname, '../src/components')
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')]
  },
  module: {
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        include: [
          path.join(projectRoot, 'src')
        ],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint',
        include: [
          path.join(projectRoot, 'src')
        ],
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: [
          path.join(projectRoot, 'src')
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file',
        query: {
          name: 'img/[name].[ext]'
        }
      },
      {
        test: /\/main\.js$/,
        loaders: ['expose-loader?socket', 'babel']
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
    ]
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  }
}
