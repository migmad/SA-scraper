[@bs.deriving abstract]
type cookie = {
  name: string,
  value: string,
};

[@bs.deriving abstract]
type post_item = {
  postID: string,
  posterID: string,
  posterUsername: string,
  img: string,
};

let cfg_to_cookies: string => Js.Promise.t(list(cookie));
let traverse: (list(cookie), int, int) => Js.Promise.t(string);
let extract_images: (string, int) => list(post_item);