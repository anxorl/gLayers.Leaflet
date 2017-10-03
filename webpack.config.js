var path = require("path")
var webpack = require("webpack")

const PATHS = {
  src: path.join(__dirname, './src'),
  dist: path.join(__dirname, './dist')
}

module.exports = {

  entry: {
    "leaflet-canvas-layer": PATHS.src + '/leaflet-canvas-layer.ts',
  },
  output: {
    path: PATHS.dist,
    filename: '[name].js',
    library: 'CanvasLayer',
    libraryTarget: 'umd'
  },
  devtool: "source-map",
  module: {
    rules: [{
        test: /\.ts$/,
        use: 'tslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader'
      }
    ]
  },
  target: 'web',

  externals: {
    'leaflet': 'leaflet',
    '../../node_modules/leaflet/dist/leaflet.css': 'leaflet/dist/leaflet.css'
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        keep_fnames: false
      },
      output: {
        comments: false
      }
    })
  ]
}