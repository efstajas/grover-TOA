const path = require('path');
const webpackCleanupPlugin = require('webpack-cleanup-plugin');
var   HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const glob = require('glob');
var   HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
		entry: {
    	'main' : './index.js',
    	'tablet' : './tablet.js',
  	}, 
  	output: {
   		path: path.resolve(__dirname, './dist'),
    	filename: '[name]/bundle.js'
  	},
  	module: {
  		rules: [
	    	{
		        test: /\.css$/,
			    use: [
			    	'style-loader',
			    	'css-loader'
			    ]
			},
			{
				test: /\.sass$/,
				use: ExtractTextPlugin.extract({
		          fallback: "style-loader",
		          use: [{loader: "css-loader"},
		          		{loader: "sass-loader",
		          		 options: {
		                    includePaths: ['node_modules', 'node_modules/@material/*']
		                    .map((d) => path.join(__dirname, d))
		                    .map((g) => glob.sync(g))
		                    .reduce((a, c) => a.concat(c), [])
                		}}]
		        })
			},
			{
		        test: /\.(png|svg|jpg|gif|eot|svg|ttf)$/,
		        use: [{
		        	loader: 'file-loader',
					options: {
					  name: '[hash].[ext]'
					}  
		        }]
	        },
	        {
		        test: /\.(woff|woff2|json)$/,
		        use: [{
		        	loader: 'file-loader',
					options: {
					  name: '[name].[ext]'
					}  
		        }]
	        },
	        {
			  test: /\.(html)$/,
			  use: {
			    loader: 'html-loader'
			    }
			}
	    ]
	},
	plugins: [
		/*new webpack.optimize.UglifyJsPlugin({
			ie8: false,
		    mangle: {
		    	except: ['$super', '$', 'exports', 'require']
      		}
		}),*/
		new webpackCleanupPlugin({
			exclude: ["*.woff", "*.woff2", "*.svg"]
		}),
     	new ExtractTextPlugin("[name]-styles.css"),
     	new HtmlWebpackPlugin({
     		filename: './index.html',
			template: './index.html',
			inlineSource: '.(js|css)$', // embed all javascript and css inline
			chunks: ["main"]
		}),
		new HtmlWebpackInlineSourcePlugin(),
		new HtmlWebpackPlugin({
     		filename: './tablet.html',
			template: './tablet.html',
			inlineSource: '.(js|css)$', // embed all javascript and css inline
			chunks: ["tablet"]
		}),
		new HtmlWebpackInlineSourcePlugin(),
		new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new CopyWebpackPlugin([
		    { from: './manifest.json', to: 'manifest.json' }
		  ],
		  ),
    ],

	node: {
	  	fs: "empty"
	}
};