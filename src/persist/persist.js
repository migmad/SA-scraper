const fs = require('fs');
const request = require('request');

let download = function (uri, filename) {
  return new Promise((resolve, reject) => {

    let options = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:68.0) Gecko/20100101 Firefox/68.0' }
    }

    request.head(uri, options, function (err, res, body) {
      if (err) {
        resolve(err.toString());
      }
      else if (!res.headers['content-type'].startsWith('image')) {
        resolve(`${uri} does not resolve to an image`);
      }
      else {
        request(uri, options)
          .on('error', error => resolve(error.toString()))
          .pipe(fs.createWriteStream(filename))
          .on('error', error => resolve(error.toString()))
          .on('close', () => resolve(`${filename} written.`));
      }
    });
  })
};

strip_url_leading = str => {
  return str.replace(/.*\//g, '');
}

let replace_naughty_characters = str => {
  return str.replace(/[^\w\.!@#$^+=-]/g, '_');
}

let download_many = list => {
  let mPromiseArray = [];
  list.forEach(downloadable => {
    let post_id = downloadable.postID;
    let poster_id = downloadable.posterID;
    let post_username = downloadable.posterUsername;
    let image_name = strip_url_leading(downloadable.img);
    let path = ""
    let filename = replace_naughty_characters(`${Date.now()}-${post_id}-${poster_id}-${post_username}-${image_name}`);
    filename = `${path}/${filename}`;
    let url = downloadable.img;

    mPromiseArray.push(download(url, filename));
  });

  return Promise.all(mPromiseArray);
}

module.exports = {
  download_many
}