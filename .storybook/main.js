/** @type { import('@storybook/react-webpack5').StorybookConfig } */
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              require.resolve('style-loader'),
              { loader: require.resolve('css-loader'), options: { importLoaders: 1 } },
              {
                loader: require.resolve('postcss-loader'),
                options: { implementation: require.resolve('postcss') },
              },
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: { builder: { useSWC: true } },
  },
  swc: () => ({
    jsc: { transform: { react: { runtime: 'automatic' } } },
  }),
  docs: { autodocs: 'tag' },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsconfigPathsPlugin({ extensions: config.resolve.extensions }),
      ];
    }
    return config;
  },
};
export default config;
