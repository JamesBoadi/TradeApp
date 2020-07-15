const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
   entry: './main.js',
   output: {
      path: path.join(__dirname, '/bundle'),
      filename: 'index_bundle.js'
   },
   
   devServer: {
      inline: true,
      port: 8001
      },
   module: {

      
      rules: [
         {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
              cwd: "/home/emerald/Pictures/smartContract/app/client",
              presets: ["@babel/preset-env", "@babel/preset-react"]
            }
         }
      ]
   },
   plugins:[
      new HtmlWebpackPlugin({
         template: './index.html'
      })
   ]
}