[@bs.deriving abstract]
type cookie = {
  name: string,
  value: string,
};

type credentials = {
  username: string,
  password: string,
};

// module Future = BsFluture;

module L =
  Relog.Relog.Make({
    let namespace = "FFI";
  });

[@bs.module "../sa_interface/sa_login.js"]
external credentials_to_cookies_:
  (string, string) => Js.Promise.t(list(cookie)) =
  "login";

[@bs.module "fs"] external path_to_cfg: string => string = "readFileSync";

let credentials_to_cookies = ({username, password}) => {
  L.info(m => m("Fetching cookies for user: %s", username));
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

let cfg_to_cookies = path =>
  path |> path_to_cfg |> cfg_to_credentials_exn |> credentials_to_cookies;