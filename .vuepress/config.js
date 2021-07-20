module.exports = {
  title: 'Ottoman.js',
  description: 'Ottoman is an ODM built for Couchbase and Node.js. ',
  themeConfig: {
    displayAllHeaders: true,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'FAQ', link: '/guides/faq.md' },
      { text: 'Quick Start', link: '/guides/quick-start.md' },
      {
        text: 'Basic',
        items: [
          { text: 'Ottoman', link: '/guides/ottoman.md' },
          { text: 'Schema', link: '/guides/schema.md' },
          { text: 'Model', link: '/guides/model.md' },
          { text: 'Document', link: '/guides/document.md' },
          { text: 'Query Builder', link: '/guides/query-builder.md' },
          { text: 'Mongoose to Ottoman', link: '/guides/mongoose-to-couchbase.md' },
          { text: 'Ottoman for Couchbase Node.js SDK devs', link: '/guides/ottoman-couchbase.md' },
          { text: 'Ottoman V1 to Ottoman V2', link: '/guides/ottomanV1-to-ottomanV2.md' },
        ],
      },
      {
        text: 'Advanced',
        items: [
          { text: 'How Ottoman Works', link: '/advanced/how-ottoman-works.md' },
          { text: 'Ottoman', link: '/advanced/ottoman.md' },
        ]
      },
      { text: 'Example', link: '/guides/first-app.md' },
      {
        text: 'API',
        items: [
          { text: 'Ottoman', link: '/classes/ottoman.html' },
          { text: 'Schema', link: '/classes/schema.html' },
          { text: 'Model', link: '/classes/model.html' },
          { text: 'Document', link: '/classes/document.html' },
          { text: 'Query Builder', link: '/classes/query.html' },
        ],
      },
      { text: 'Github', link: 'https://github.com/couchbaselabs/node-ottoman' },
    ],
    sidebar: 'auto',
  },
  plugins: ['@vuepress/medium-zoom', '@vuepress/back-to-top', 'vuepress-plugin-smooth-scroll', 'one-click-copy'],
};
