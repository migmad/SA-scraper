module Logger = Relog.Relog;
module L =
  Logger.Make({
    let namespace = "Main";
  });
module Future = BsFluture;

let main = () => {
  Logger.setReporter(Logger.format_reporter(~level=Logger.Level.Debug, ()));
  let config_file_path = "./settings.json";

  L.info(m => m("Reading config file at %s", config_file_path));
  let _ =
    config_file_path
    |> Future.encaseP(path => Ffi.cfg_to_cookies(path))
    |> Future.chain(cookies => {
         Js.log(cookies);
         Future.encaseP3(
           (p1, p2, p3) => Ffi.traverse(p1, p2, p3),
           cookies,
           3813092,
           1,
         );
       })
    |> Future.map(result => Ffi.extract_images(result, 0))
    |> Future.map(result => Js.log(result))
    |> Future.fork(_ => (), _ => ());
  ();
};

main();