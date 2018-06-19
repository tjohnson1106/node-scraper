const _ = require("lodash");

const {
  compose,
  composeAsync,
  extractNumber,
  enforceHttpsUrl,
  fetchHtmlFromUrl,
  extractFromElems,
  fromPairsToObject,
  fetchElemInnerText,
  fetchElemAttribute,
  extractUrlAttribute
} = require("./helpers");

const SCOTCH_BASE = "https://scotch.io";

const scotchRelativeUrl = url =>
  _.isString(url)
    ? `${SCOTCH_BASE}${url.replace(/^\/*?/, "/")}`
    : null;

const extractScotchUrlAttribute = attrs =>
  compose(
    enforceHttpsUrl,
    scotchRelativeUrl,
    fetchElemAttribute(attr)
  );
