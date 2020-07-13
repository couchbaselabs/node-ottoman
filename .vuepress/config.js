module.exports = {
  title: 'Ottoman.js',
  description: 'Ottoman is a ODM built for Couchbase and Node.js. ',
  themeConfig: {
    displayAllHeaders: true,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/guides/quick-start.md' },
      { text: 'Connections', link: '/guides/connections.md' },
      { text: 'Schema', link: '/guides/schema.md' },
      { text: 'Model', link: '/guides/model.md' },
      { text: 'Document', link: '/guides/document.md' },
      { text: 'Query Builder', link: '/guides/query-builder.md' },
      { text: 'Example', link: '/guides/first-app.md' },
      {
        text: 'API',
        items: [
          { text: 'Ottoman', link: '/classes/ottoman.html' },
          { text: 'Connections', link: '/classes/connectionmanager.html' },
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
