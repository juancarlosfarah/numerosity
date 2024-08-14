/** @param {import("webpack").Configuration} config */
export function webpack(config) {
    config.resolve.alias['seedrandom/lib/alea'] = 'seedrandom/lib/alea.js';
    return config;
}

/** @param {import("webpack-dev-server").Configuration} devServerConfig */
export function webpackDevServer(devServerConfig) {
    return devServerConfig;
}