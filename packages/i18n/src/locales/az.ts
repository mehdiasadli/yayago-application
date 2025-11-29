import type { Translations } from '../index';

export const az: Translations = {
  enums: {
    TrafficDirection: {
      LEFT: 'Sol',
      RIGHT: 'Sağ',
      HYBRID: 'Hibrid',
    },
  },
  common: {
    welcome: 'yayaGo-ya xoş gəlmisiniz',
    save: 'Yadda saxla',
    cancel: 'Ləğv et',
  },
  auth: {
    login: 'Giriş',
    logout: 'Çıxış',
    errors: {
      invalid_email: 'Yanlış email ünvanı',
      user_not_found: 'İstifadəçi tapılmadı',
    },
  },
  car: {
    make: 'Marka',
    model: 'Model',
    price: 'Qiymət',
  },
};
