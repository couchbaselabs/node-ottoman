/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    'quick-start',
    {
      type: 'category',
      label: 'Basic',
      items: ['basic/schema', 'basic/model', 'basic/document', 'basic/ottoman', 'basic/query-builder'],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/fts',
        'advanced/transactions',
        'advanced/how-ottoman-works',
        'advanced/ottoman',
        'advanced/mongoose-to-couchbase',
        'advanced/ottoman-couchbase',
        'advanced/ottomanV1-to-ottomanV2',
        'advanced/sdk-comparison',
      ],
    },
    'first-app',
    'cli/cli',
    {
      type: 'category',
      label: 'API',
      link: {
        type: 'doc',
        id: 'api/index',
      },
      items: require('./docs/api/typedoc-sidebar.cjs'),
    },
    'faq',
  ],
};

module.exports = sidebars;
