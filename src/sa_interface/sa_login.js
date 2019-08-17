const request = require('request-promise-native');
const cookie = require('cookie');
const { urlify } = require('../sa_interface/sa_utils.js');

let easify = (list) => {
  let retVal = [];
  list.forEach(element => {
    Object.keys(element).forEach(item => {
      switch (item) {
        case "__cfduid":
        case "bbuserid":
        case "bbpassword":
          {
            retVal.push({
              name: item,
              value: element[item]
            });
          };
        default: return;
      }
    });
  });
  return retVal;
}

let login = async (username, password) => {
  let login_endpoint = urlify("account.php");
  let options = {
    method: "POST",
    uri: login_endpoint,
    form: {
      action: "login",
      username,
      password,
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
    return easify(cookies);
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  login
}