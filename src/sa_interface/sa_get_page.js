const { urlify } = require('./sa_utils.js');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let get_page = async (cookies, threadID, page) => {
  const request = require('request-promise-native');
  let per_page = 40;
  let thread_endpoint = urlify(`showthread.php?threadid=${threadID}&perpage=${per_page}&pagenumber=${page}`);
  let cookie_str = "";

  cookies.forEach(cookie => {
    cookie_str = cookie_str + `${cookie.name}=${cookie.value}; `;
  });

  // console.log(cookie_str);

  let options = {
    method: "GET",
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:68.0) Gecko/20100101 Firefox/68.0', "Cookie": cookie_str },
    uri: thread_endpoint,
    simple: false,
    resolveWithFullResponse: true,
  }
  try {
    let response = await request(options);

    if (response.statusCode >= 400) {
      throw (response);
    }

    // console.log(
    //   "--------------------------------------------------------------------------------\n"
    //   , response.body.includes("JOINING THE SA FORUMS WILL REMOVE THIS BIG AD, THE ANNOYING UNDERLINED ADS, AND STUPID INTERSTITIAL ADS!!")
    //   , "\n--------------------------------------------------------------------------------")
    return [cookies, response.body];
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  get_page
}