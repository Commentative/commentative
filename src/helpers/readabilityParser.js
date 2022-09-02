const fetch = require("node-fetch");

const Readability = require("readability");
const { JSDOM } = require("jsdom");

module.exports = async (url) => {
  const fetchResponse = await fetch(url);
  const pageHTML = await fetchResponse.text();
  const doc = new JSDOM(pageHTML, { url });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  return article;
};
