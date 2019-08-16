const request = require('request-promise-native');
const base_url = "https://forums.somethingawful.com/";
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('settings.json'));
const cookie = require('cookie');

let urlify = (str) => {
  let retVal = "";

  if (str[0] === '/') {
    retVal = str.slice(1);
  }
  else {
    retVal = str;
  }

  if (retVal[retVal.length - 1] === '/') {
    retVal = retVal.slice(0, retVal.length - 1);
  }

  return base_url + retVal;
};

let login = async () => {
  let login_endpoint = urlify("account.php");
  let username = settings.username;
  let password = settings.password;
  let options = {
    method: "POST",
    uri: login_endpoint,
    form: {
      action: "login",
      username: username,
      password: password,
      next: '/'
    },
    simple: false,
    resolveWithFullResponse: true
  }
  try {
    let response = await request(options);

    if (response.statusCode >= 400) {
      throw (response);
    }

    let cookies = [];
    response.headers['set-cookie'].forEach(element => {
      cookies.push(cookie.parse(element));
    });

    return cookies;
  } catch (error) {
    console.log(error)
  }
};

login().then(console.log);