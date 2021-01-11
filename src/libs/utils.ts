import { default as slg } from 'slug';
import { StatsCountIds } from './types';

export const getEnvironment = (): string => {
  const { STAGE, NODE_ENV = 'development' } = process.env;
  return STAGE || NODE_ENV;
};

const isNotTestEnv = getEnvironment() !== 'test';

export class Logger {
  static log(message?: any, ...optionalParams: any[]) {
    isNotTestEnv && console.log(message, ...optionalParams);
  }
  static info(message?: any, ...optionalParams: any[]) {
    isNotTestEnv && console.info(message, ...optionalParams);
  }
  static warn(message?: any, ...optionalParams: any[]) {
    isNotTestEnv && console.warn(message, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }
}

export const getCountAndIds = (array: any = []): StatsCountIds => {
  let ids = [];
  try {
    ids = array.filter(Boolean).map(({ sys }) => sys.id);
  } catch (error) {}
  return { count: array.length, ids };
};

export const slug = (value: string) =>
  slg(value, {
    lower: true,
    charmap: {
      ä: 'ae',
      ü: 'ue',
      ö: 'oe',
      ß: 'ss',
      Ä: 'Ae',
      Ü: 'Ue',
      Ö: 'Oe',
    },
  });
