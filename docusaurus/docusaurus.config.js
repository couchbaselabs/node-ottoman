// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
require('dotenv').config();

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Ottoman.js',
  tagline: 'ODM for couchbase server',
  url: 'https://ottomanjs.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Couchbase', // Usually your GitHub org/user name.
  projectName: 'Ottoman', // Usually your repo name.
  trailingSlash: false,

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Ottoman',
        logo: {
          alt: 'Ottoman Logo',
          src: 'img/logo.svg',
        },
        items: [
          { label: 'Home', to: '/', position: 'right' },
          { label: 'Quick Start', to: '/docs/quick-start', position: 'right' },
          {
            label: 'Basic',
            items: [
              { label: 'Ottoman', to: '/docs/basic/ottoman' },
              { label: 'Schema', to: '/docs/basic/schema' },
              { label: 'Model', to: '/docs/basic/model' },
              { label: 'Document', to: '/docs/basic/document' },
              { label: 'Query Builder', to: '/docs/basic/query-builder' },
            ],
            position: 'right',
          },
          {
            label: 'Advanced',
            items: [
              { label: 'How Ottoman Works', to: '/docs/advanced/how-ottoman-works' },
              { label: 'Ottoman', to: '/docs/advanced/ottoman' },
              { label: 'Mongoose to Ottoman', to: '/docs/advanced/mongoose-to-couchbase' },
              { label: 'Ottoman for Couchbase Node.js SDK devs', to: '/docs/advanced/ottoman-couchbase' },
              { label: 'Ottoman V1 to Ottoman V2', to: '/docs/advanced/ottomanV1-to-ottomanV2' },
            ],
            position: 'right',
          },
          { label: 'CLI', to: '/docs/cli', position: 'right' },
          { label: 'Example', to: '/docs/first-app', position: 'right' },
          { label: 'FAQ', to: '/docs/faq', position: 'right' },
          {
            href: 'https://github.com/couchbaselabs/node-ottoman',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Couchbase, Inc. Licensed under the Apache License, Version 2.0.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: process.env.ALGOLIA_APP_ID || 'dev',
        apiKey: process.env.ALGOLIA_API_KEY || 'dev',
        indexName: 'ottomanjs',
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
      },
    }),
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        exclude: '**/node_modules/**',
      },
    ],
  ],
};

module.exports = config;
