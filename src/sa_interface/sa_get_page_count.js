const cheerio = require('cheerio');

const get_page_count = html => {
  let $ = cheerio.load(html);
  return parseInt($("[title*='Last page']")[0].children[0].data);
}

module.exports = {
  get_page_count
}
