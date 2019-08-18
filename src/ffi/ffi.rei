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
  cookies: list(cookie),
};

[@bs.deriving abstract]
type post_item = {
  postID: string,
  posterID: string,
  posterUsername: string,
  img: string,
};

let cfg_to_cookies: string => Js.Promise.t(list(cookie));
let get_page:
  (list(cookie), int, int) => Js.Promise.t((list(cookie), string));
let get_page_images: string => list(post_item);
let persist_images_fs: list(post_item) => unit;
let get_thread_essentials: (string, int) => Future.t(Js.Exn.t, thread);