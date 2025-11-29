import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import az from 'i18n-iso-countries/langs/az.json';
import ru from 'i18n-iso-countries/langs/ru.json';
import ar from 'i18n-iso-countries/langs/ar.json';

countries.registerLocale(en);
countries.registerLocale(az);
countries.registerLocale(ru);
countries.registerLocale(ar);

export { countries };
