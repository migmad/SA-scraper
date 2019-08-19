open Modules;

module Future = BsFluture;

[@bs.deriving abstract]
type cookie = {
  name: string,
  value: string,
};

[@bs.deriving abstract]
type thread = {
  threadID: int,
  thread_page_count: int,
  cookies: array(cookie),
};

[@bs.deriving abstract]
type post_item = {
  postID: string,
  posterID: string,
  posterUsername: string,
  img: string,
};

let cfg_to_cookies: string => Js.Promise.t(array(cookie));
let get_page:
  (array(cookie), int, int) => Js.Promise.t((array(cookie), string));
let get_page_images: string => array(post_item);
let persist_images_fs:
  (int, array(post_item)) => Future.t(Js.Exn.t, array(string));
let get_thread_essentials: (string, int) => Future.t(Js.Exn.t, thread);