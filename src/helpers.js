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

// Handles the request(Promise)

const sendResponse = res => async request => {
  return await request
    .then(data => res.json({status: "succes", data}))
    .catch(({status: code = 500}) =>
      res.status(code).json({
        status: "failure",
        code,
        message: code == 404 ? "Not found" : "Request failed"
      })
    );
};

/**
 * Loads the html string returned for the given URL
 * and sends a Cheerio parser instance of the loaded HTML
 */

const fetchHtmlFromUrl = async url => {
  return await axios
    .get(enforceHttpsUrl(url))
    .then(response => cheerio.load(response.data))
    .catch(error => {
      error.status = (error.response && error.response.status) || 500;
    });
};
