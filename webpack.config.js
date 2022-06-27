export const webpackConfig = {
  entry: {
    main: ["./app/js/main.js"],
  },
  output: {
    filename: "[name].min.js",
    chunkFilename: "[name].js",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
};
