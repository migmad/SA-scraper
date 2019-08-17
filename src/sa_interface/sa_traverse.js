const { urlify } = require('../sa_interface/sa_utils.js');
const cheerio = require('cheerio');

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
    let $ = cheerio.load(response.body);
    let posts = [];
    $('.post .postbody > img').each((_, post) => {
      let postID = $(post).parents('.post')[0].attribs.id; // wow
      let posterID = $($(post).parents('.post')[0]).find('[class^="userinfo userid"]')[0].attribs.class; // wow2
      let posterUsername = $($(post).parents('.post')).find('[class^="author"]')[0].children[0].data; // wow3
      let postIMG = post.attribs;
      posts.push({ postID, posterID: posterID.replace('userinfo userid-', ''), posterUsername, postIMG });
    });

    posts = posts
      .filter(item => !item.postIMG.title)
      .filter(item => item.posterUsername !== 'Adbot')
      .map(item => {
        return { postID: item.postID, posterID: item.posterID, posterUsername: item.posterUsername, img: item.postIMG.src }
      });

    return posts;
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  traverse_page
}