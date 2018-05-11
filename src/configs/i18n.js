const i18n = require('i18n');

i18n.configure({
  locales:['si'],
  defaultLocale: 'si',
  queryParameter: 'lang',
  directory: path.join(__dirname, 'src', 'locales')
});

module.exports.i18n = i18n;