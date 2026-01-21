
import { CURRENCY } from './constants';

export const formatCurrency = (amount: number) => {
  return `${CURRENCY} ${amount.toLocaleString('en-PK')}`;
};

export const calculate7030 = (amount: number) => {
  const recoverable = amount * 0.7;
  const waiver = amount * 0.3;
  return { recoverable, waiver };
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getMonthName = (date: string) => {
  return new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' });
};
