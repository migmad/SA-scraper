module Html: {
  type t;
  let of_string: string => t;
  let to_string: t => string;
} = {
  type t =
    | Html(string);

  let of_string = str => Html(str);
  let to_string = (Html(str)) => str;
};