// Currency configuration
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  TND: { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  LYD: { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' }
};

export const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  TND: 3.12,
  LYD: 4.81
};

export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD;
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  });
  return formatter.format(amount);
};

export const convertCurrency = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  const inUSD = amount / EXCHANGE_RATES[fromCurrency];
  return inUSD * EXCHANGE_RATES[toCurrency];
};