const { urlify } = require('../sa_interface/sa_utils.js');

let traverse_page = async (cookies, threadID, page) => {
  const request = require('request-promise-native');
  let per_page = 40;
  let thread_endpoint = urlify(`showthread.php?threadid=${threadID}&perpage=${per_page}&page=${page}`);
  let jar = request.jar();

  cookies.forEach(cookie => {
    let request_cookie = request.cookie(`${cookie.name}=${cookie.value}`);
    jar.setCookie(request_cookie);
  });

  let options = {
    method: "GET",
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:68.0) Gecko/20100101 Firefox/68.0' },
    uri: thread_endpoint,
    simple: false,
    resolveWithFullResponse: true,
    jar
  }
  try {
    let response = await request(options);

    if (response.statusCode >= 400) {
      throw (response);
    }
    return response.body;
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  traverse_page
}