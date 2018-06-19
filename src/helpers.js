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

// Fetches the inner text of the element

const fetchElemInnerText = elem =>
  (elem.text && elem.text().trim()) || null;

//specified attribute
const fetchElemAttribute = attribute => elem =>
  (elem.attr && elem.attr(attribute)) || null;

//fetches specified attributes

const extractFromElems = extractor => transform => elems => $ => {
  const results = elems
    .map((i, element) => extractor($(element)))
    .get();
  return _.isFunction(transform) ? transform(results) : results;
};

//extracts and sanitizes number text from element

const extractNumber = compose(
  parseInt,
  sanitizeNumber,
  fetchElemInnerText
);

// extracts url string from the element's attribute(attr) returns url with https

const extractUrlAttribute = attr =>
  compose(
    enforceHttpsUrl,
    fetchElemAttribute(attr)
  );

module.exports = {
  compose,
  composeAsync,
  enforceHttpsUrl,
  sanitizeNumber,
  withoutNulls,
  arrayPairsToObject,
  fromPairsToObject,
  sendResponse,
  fetchHtmlFromUrl,
  fetchElemInnerText,
  fetchElemAttribute,
  extractFromElems,
  extractNumber,
  extractUrlAttribute
};
