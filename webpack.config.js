const path = require("path")
const webpack = require("webpack")

const HTMLPlugin = require("html-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MinifyPlugin = require("babel-minify-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isProduction = process.env.NODE_ENV === "PRODUCTION"

let webpackConfig = {
  // if in development we will build source maps, otherwise we don't need them
  devtool: isProduction
    ? false
    : "inline-source-map",

  // for development start a development server on port 9000, serve static files from the ./static folder  
  devServer: {
    contentBase: path.resolve(__dirname, "./static"),
    compress: true,
    port: 9000,
    hot: true,
    inline: true
  },

  // the main script
  entry: {
    app: "./src/index.js"
  },
  
  // where to output files
  output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "js/[name].js"
  },

  // some aliases for easing the development
  resolve: {
		alias: {
			"src": path.resolve(__dirname, "./src"),
			"styles": path.resolve(__dirname, "./src/styles"),
		},
    extensions: ['.js', '.css']
  },

  // these are the transformations applied to the files
  module: {
    rules: [
      // javascript will be processed by babel, so we can use modern JS features without fearing of browser compatibility
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/
			},

      // url loader will parse images and inline them if they are small enough in size
			{
				test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
				loader: "url-loader",
				options: {
					limit: 10000,
					name: "img/[name].[hash:16].[ext]"
				}
			},

      // same for fonts
			{
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				loader: "url-loader?limit=10000"
      },

      // no optimization for css, just extract it in a separate file
      {
        test: /\.(css)$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
            loader: "css-loader",
            options: {
              minimize: true,
              discardComments: {
                removeAll: true
              }
            }
          }]
        })
      },

      // same for html
      {
        test: /\.html$/,
        loader: "raw-loader"
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "PRODUCTION": isProduction
    }),
    // this will automatically add the scripts tags at the end of the html file 
    new HTMLPlugin({
			template: "src/index.template.html"
    }),
    new HtmlWebpackHarddiskPlugin({
      alwaysWriteToDisk: true
    }),
    new ExtractTextPlugin("style.css")
  ]
}

// when building for production addittional things need to be taken care of
if (isProduction) {
	webpackConfig.plugins.push(
    // copy everything from the static folder to the dist folder
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './static'),
        to: path.resolve(__dirname, './dist'),
        ignore: ['.*']
      }
    ]),
		// minify JS
    new MinifyPlugin(),

    // perform some other optimization magic
    new webpack.optimize.ModuleConcatenationPlugin()
  )
}

module.exports = webpackConfig