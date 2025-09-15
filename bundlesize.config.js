module.exports = [
  {
    name: 'JavaScript bundles',
    path: '.next/static/chunks/*.js',
    maxSize: '1 MB',
    compression: 'gzip',
  },
  {
    name: 'CSS bundles',
    path: '.next/static/css/*.css',
    maxSize: '100 KB',
    compression: 'gzip',
  },
  {
    name: 'Main bundle',
    path: '.next/static/chunks/pages/_app-*.js',
    maxSize: '500 KB',
    compression: 'gzip',
  },
  {
    name: 'Framework bundle',
    path: '.next/static/chunks/framework-*.js',
    maxSize: '200 KB',
    compression: 'gzip',
  },
];
