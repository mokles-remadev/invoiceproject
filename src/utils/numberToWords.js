import { numberToWords } from 'number-to-words';

export const convertAmountToWords = (amount, currency = 'USD') => {
  const wholeNumber = Math.floor(amount);
  const decimal = Math.round((amount - wholeNumber) * 100);
  
  const wholeWords = numberToWords.toWords(wholeNumber);
  const decimalWords = numberToWords.toWords(decimal);
  
  const currencyNames = {
    USD: { whole: 'dollar', decimal: 'cent' },
    EUR: { whole: 'euro', decimal: 'cent' },
    TND: { whole: 'dinar', decimal: 'millime' },
    LYD: { whole: 'dinar', decimal: 'dirham' }
  };
  
  const { whole, decimal: decimalName } = currencyNames[currency] || currencyNames.USD;
  
  return `${wholeWords} ${whole}${wholeNumber !== 1 ? 's' : ''} and ${decimalWords} ${decimalName}${decimal !== 1 ? 's' : ''}`;
};