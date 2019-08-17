const base_url = "https://forums.somethingawful.com/";

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

module.exports = { urlify }