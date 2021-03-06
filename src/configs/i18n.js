const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales:['si'],
  defaultLocale: 'si',
  queryParameter: 'lang',
  directory: path.join(appRoot, 'src', 'locales')
});

module.exports = i18n;