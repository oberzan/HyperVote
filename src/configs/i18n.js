import i18n from 'i18n';

i18n.configure({
  locales:['si'],
  defaultLocale: 'si',
  queryParameter: 'lang',
  directory: path.join(__dirname, 'src', 'locales')
});

export default i18n;