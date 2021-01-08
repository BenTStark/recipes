/****************************
Packages
****************************/
var path = require("path");
var minimist = require("minimist");
var _ = require("lodash");
var chalk = require("chalk");
//------------------
// var fs = require("fs");

// var yaml = require("js-yaml");
/****************************
Plugins
****************************/
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
//------------------
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
//   .BundleAnalyzerPlugin;
// const CleanWebpackPlugin = require("clean-webpack-plugin");
// const Dotenv = require("dotenv-webpack");

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

//const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");

/****************************
Implement Modules
****************************/
const moduleObj = {
  rules: [
    {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ["babel-loader"]
    },
    {
      test: /\.(scss|css)$/,
      use: ["style-loader","css-loader","sass-loader"]
    }
  ]
};

/****************************
Basic Config
****************************/
const smp = new SpeedMeasurePlugin();

// // Wifi 
// var myEnv = minimist(process.argv.slice(2)).ENV;
// if (!myEnv) {
//   console.log(chalk.bold.red("No Environment provided! Add Argument with --ENV=YourENV\n"));
//   console.log(chalk.bold.red("Check also confg.yaml!\n\n"));
//   process.exit(1);
// }
// console.log("My Environment: " + myEnv)
// // Source: Local or DDNS
// var source = minimist(process.argv.slice(2)).SOURCE;
// if (!source) {
//   source = "local"
// }
// console.log("SOURCE: " + source)

// // Read Config.yaml
// var env = {};
// try {
//   var config = yaml.safeLoad(fs.readFileSync("../config.yaml", "utf8"));
//   config.env.forEach(realEnv => {
//     if (realEnv.env === myEnv) {
//       env = realEnv;
//     }
//   });
//   env.auth0 = config.auth0[myEnv][source];
// } catch (e) {
//   console.log(e);
// }

var DEFAULT_TARGET = "DEV_SERVER";

/****************************
Webpack Options
****************************/
// Generel parameter configuration for every webpack build
var DEFAULT_PARAMS = {
  resolve: {
    extensions: [".js"],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/")
    } 
  },
  entry: { index: path.resolve(__dirname, "src/app", "index.js") },
  // entry: [
  //   "webpack-dev-server/client?http://" + env.baseURL[source] + "/",
  //   "webpack/hot/only-dev-server",
  //   
  // ],
  target: "web",
  module: moduleObj,
  plugins: [
    new HtmlWebPackPlugin({
      title: "React Boilerplate WebDevServer",
      filename: "index.html",
      template: 'src/app/index.html'
      //template: path.resolve(__dirname, "app", "index.html")
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};

// Special Parameters: Depending on args TARGET
var PARAMS_PER_TARGET = {
  DEV: {
    devtool: "source-map",
    output: {
      filename: "index.js"
    },
    mode: "development",
    optimization: {
      minimize: false
    },
    plugins: [
      new BundleAnalyzerPlugin({ analyzerMode: "disabled" })
    ]
  },

  DEV_SERVER: {
    devtool: "source-map",
    mode: "development",
    watchOptions: {
      ignored: /node_modules/
    },
    output: {
      filename: "index.js",
      publicPath: "/"
    },
    devServer: {
      open: true,
      compress: true,
      hot: true,
      //disableHostCheck: true,
      //publicPath: "/",
      //host: "127.0.0.1",
      port: 9000,
      //https: false,
      historyApiFallback: true
    }
  },

  // BUILD: {
  //   entry: path.resolve(__dirname, "client/app/index.js"),
  //   output: {
  //     path: path.join(__dirname, env.buildPath)
  //   },
  //   devtool: "source-map",
  //   mode: "production",
  //   plugins: [new CleanWebpackPlugin(), new HtmlWebPackPlugin({
  //     hash: true,
  //     filename: path.join(__dirname, env.buildPath, "/index.html")
  //   })
  //   ]
  // }
};

// Merge Default Parameters with speical parameters
var target = _resolveBuildTarget(DEFAULT_TARGET);
var params = _.merge(
  DEFAULT_PARAMS,
  PARAMS_PER_TARGET[target],
  _mergeArraysCustomizer
);

// Console Output
_printBuildInfo(target, params);
// Webpack execution
//module.exports = smp.wrap(params);
module.exports = params


// Help Functions
// Get Target from args of command line
function _resolveBuildTarget(defaultTarget) {
  var target = minimist(process.argv.slice(2)).TARGET;
  if (!target) {
    console.log("No build target provided, using default target instead\n\n");
    console.log(path.resolve(__dirname))
    target = defaultTarget;
  }
  return target;
}

// Write Console Output Function
function _printBuildInfo(target, params) {
  console.log("\nStarting " + chalk.bold.green('"' + target + '"') + " build");
  if (target === "DEV_SERVER") {
    console.log(
      "Dev server: " +
      chalk.bold.yellow(
        "http://localhost:" + params.devServer.port + "/lokal"
      ) +
      "\n\n"
    );
  } else {
    console.log(chalk.bold.red("Webpack Parameter"));
    console.log(chalk.bold.red("---------------------------------"));
    console.log(params);
    console.log(chalk.bold.red("---------------------------------"));
  }
}

// Merge Arrays
function _mergeArraysCustomizer(a, b) {
  if (_.isArray(a)) {
    return a.concat(b);
  }
}
