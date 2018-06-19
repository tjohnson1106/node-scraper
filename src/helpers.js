const _ = require("lodash");
const axios = require("axios");
const cheerio = require("cheerio");

//utility functions

const compose = (...fns) => arg => {
  return _.flattenDeep(fns).reduceRight((current, fn) => {
    if (_.isFunction(fn)) return fn(current);
    throw new TypeError(
      "compose() expects only functions as parameters."
    );
  }, arg);
};

const composeAsync = (...fns) => arg => {
  return _.flattenDeep(fns).reduceRight(async (current, fn) => {
    if (_.isFunction(fn)) return fn(await current);
    throw new TypeError(
      "compose() expects only functions as parameters."
    );
  }, arg);
};

const enforceHttpsUrl = url =>
  _.isString(url) ? url.replace(/^(https?:)?\/\//, "https://") : null;

const sanitizeNumber = number =>
  _.isString(number)
    ? number.replace(/[^0-9-.]/g, "")
    : _.isNumber(number)
      ? number
      : null;

//filters null values from array
const withoutNulls = arr =>
  _.isArray(arr) ? arr.filter(val => !_.isNull(val)) : [];

//transforms array to an object

const arrayPairsToObject = arr =>
  arr.reduce((obj, pair) => ({...obj, ...pair}), {});

const fromPairsToObject = compose(
  arrayPairsToObject,
  withoutNulls
);
