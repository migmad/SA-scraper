const cheerio = require('cheerio');

const extract_images = html => {
  let $ = cheerio.load(html);
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
}

module.exports = {
  extract_images
}