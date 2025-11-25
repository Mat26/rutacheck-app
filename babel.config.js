module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@src": "./src",
            "@features": "./src/features",
            "@shared": "./src/shared",
          },
          extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
        },
      ],
    ],
  };
};
