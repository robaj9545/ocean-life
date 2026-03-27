const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force all three.js dependencies to resolve exactly to the root node_modules version
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

config.resolver.extraNodeModules = {
  three: path.resolve(__dirname, 'node_modules/three'),
};

config.resolver.assetExts.push('obj', 'mtl', 'glb', 'gltf', 'png', 'jpg');

module.exports = config;
