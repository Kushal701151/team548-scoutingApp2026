module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      require.resolve("expo-router/babel"),
      require.resolve("nativewind/babel"),
      [
        "module-resolver",
        {
          alias: {
            "@/assets": "./assets",
            "@/app": "./app",
            "@/components": "./components", // Fixed typo here (componpnents -> components)
            "@/utils": "./utils",
            "@/state": "./state",
            "@/types": "./types",
          },
        },
      ],
      "react-native-reanimated/plugin", // <--- THIS MUST BE LAST
    ],
  };
};