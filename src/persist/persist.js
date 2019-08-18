const fs = require('fs');
const request = require('request-promise-native');

let download = function (uri, filename, callback) {
  try {
    let options = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:68.0) Gecko/20100101 Firefox/68.0' }
    }

    request.head(uri, options, function (err, res, body) {
      if (err) {
        console.log(err);
        return;
      }
      else if (!res.headers['content-type'].startsWith('image')) {
        console.log("URL does not resolve to an image");
        return;
      }
      else {
        request(uri, options).pipe(fs.createWriteStream(filename)).on('close', callback);
      }
    });
  }
  catch (err) {
    console.log(err);
  }
};

strip_url_leading = str => {
  return str.replace(/.*\//g, '');
}

let replace_spaces = str => {
  return str.replace(/[^\w\.!@#$^+=-]/g, '_');
}

let download_many = list => {
  list.forEach(downloadable => {
    let post_id = downloadable.postID;
    let poster_id = downloadable.posterID;
    let post_username = downloadable.posterUsername;
    let image_name = strip_url_leading(downloadable.img);
    let path = "~/Pictures/downloads"
    let filename = replace_spaces(`${post_id}-${poster_id}-${post_username}-${image_name}`);
    filename = `${path}/${filename}`;
    let url = downloadable.img;

    download(url, filename, () => console.log(`${filename} written.`));
  });
}

module.exports = {
  download_many
}