[@bs.deriving abstract]
type cookie = {
  name: string,
  value: string,
};

type credentials = {
  username: string,
  password: string,
};

[@bs.deriving abstract]
type post_item = {
  postID: string,
  posterID: string,
  posterUsername: string,
  img: string,
};

[@bs.deriving abstract]
type thread = {
  threadID: int,
  thread_page_count: int,
  cookies: list(cookie),
};
module L =
  Relog.Relog.Make({
    let namespace = "FFI";
  });

module Future = BsFluture;

open Modules;

[@bs.module "../sa_interface/sa_login.js"]
external credentials_to_cookies_:
  (string, string) => Js.Promise.t(list(cookie)) =
  "login";

[@bs.module "../sa_interface/sa_get_page.js"]
external get_page_:
  (list(cookie), int, int) => Js.Promise.t((list(cookie), string)) =
  "get_page";

[@bs.module "../sa_interface/sa_extract_images.js"]
external get_page_images_: string => list(post_item) = "extract_images";

[@bs.module "../sa_interface/sa_get_page_count.js"]
external get_page_count_: string => int = "get_page_count";

[@bs.module "../persist/persist.js"]
external persist_images_fs_: list(post_item) => unit = "download_many";

[@bs.module "fs"] external path_to_cfg: string => string = "readFileSync";

let credentials_to_cookies = ({username, password}) => {
  L.debug(m => m("Fetching cookies for user: %s", username));
  credentials_to_cookies_(username, password);
};

let cfg_to_credentials_exn = str => {
  let json =
    try (str |> Js.Json.parseExn) {
    | _ =>
      L.error(m => m("Config file is not valid JSON."));
      exit(-1);
    };

  let json_dict =
    switch (Js.Json.classify(json)) {
    | Js.Json.JSONObject(value) => value
    | _ =>
      L.error(m => m("Config File is not a JSON Object."));
      exit(-1);
    };

  let username_json =
    switch (Js.Dict.get(json_dict, "username")) {
    | Some(username) => username
    | None =>
      L.error(m => m("password key not found in config file."));
      exit(-1);
    };
  let password_json =
    switch (Js.Dict.get(json_dict, "password")) {
    | Some(password) => password
    | None =>
      L.error(m => m("password key not found in config file."));
      exit(1);
    };

  let username =
    switch (Js.Json.decodeString(username_json)) {
    | Some(user) => user
    | None =>
      L.error(m => m("Null or undefined username."));
      exit(1);
    };
  let password =
    switch (Js.Json.decodeString(password_json)) {
    | Some(pass) => pass
    | None =>
      L.error(m => m("Null or undefined password."));
      exit(1);
    };

  {username, password};
};

let persist_images_fs = posts => {
  L.debug(m => m("Persisting %d images...", List.length(posts)));
  persist_images_fs_(posts);
};

let get_page_images = html => {
  L.debug(m => m("Parsing page..."));
  get_page_images_(html);
};

let get_page_count = html => {
  let num_pages = get_page_count_(html);
  L.debug(m => m("Thread has %d pages", num_pages));
  num_pages;
};

let get_page = (cookies, threadID, page) => {
  L.debug(m => m("Requesting thread #%d page#%d", threadID, page));
  get_page_(cookies, threadID, page);
};

let cfg_to_cookies = path =>
  path |> path_to_cfg |> cfg_to_credentials_exn |> credentials_to_cookies;

let get_thread_essentials = (config_file_path, threadID) => {
  config_file_path
  |> Future.encaseP(path => cfg_to_cookies(path))
  |> Future.map(cookies => (cookies, threadID))
  |> Future.chain(((cookies, threadID)) =>
       Future.encaseP3(
         (p1, p2, p3) => get_page(p1, p2, p3),
         cookies,
         threadID,
         1,
       )
     )
  |> Future.map(((cookies, html)) => {
       let page_count = get_page_count(html);
       thread(~threadID, ~thread_page_count=page_count, ~cookies);
     });
};