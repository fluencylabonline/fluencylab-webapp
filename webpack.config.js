// webpack.config.js

module.exports = {
    // other webpack configurations...
    module: {
      rules: [
        {
          test: /\.(node)$/,
          loader: 'node-loader',
        },
      ],
    },
  };
  