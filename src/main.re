module Logger = Relog.Relog;
module L =
  Logger.Make({
    let namespace = "Main";
  });
module Future = BsFluture;

let rec generate_computation_list = (cookies, threadID, page, acc) => {
  switch (page) {
  | 0 =>
    L.debug(m => m("Computation list length: %d", List.length(acc)));
    acc;
  | _ =>
    let computation_list = {
      [
        Future.encaseP3(
          (p1, p2, p3) => Ffi.get_page(p1, p2, p3),
          cookies,
          threadID,
          page,
        ),
        ...acc,
      ];
    };
    generate_computation_list(cookies, threadID, page - 1, computation_list);
  };
};

let rec future_fold_left = (fn, acc, list) => {
  switch (list) {
  | [] => Future.resolve(acc)
  | [x, ...xs] =>
    x |> Future.chain(value => future_fold_left(fn, fn(acc, value), xs))
  };
};

let future_iter = (fn, list) => {
  future_fold_left(((), v) => fn(v), (), list);
};

let main = () => {
  Logger.setReporter(Logger.format_reporter(~level=Logger.Level.Debug, ()));
  let config_file_path = "./settings.json";

  L.info(m => m("Reading config file at %s", config_file_path));
  let _ =
    Ffi.get_thread_essentials(config_file_path, 3813092)
    |> Future.map(thread => {
         L.info(m =>
           m(
             "Got essential thread information.\nThread: %d\nPages: %d",
             thread->Ffi.threadIDGet,
             thread->Ffi.thread_page_countGet,
           )
         );
         thread;
       })
    |> Future.map(thread =>
         generate_computation_list(
           thread->Ffi.cookiesGet,
           thread->Ffi.threadIDGet,
           thread->Ffi.thread_page_countGet,
           [],
         )
         |> future_iter(((_, html)) =>
              html |> Ffi.get_page_images |> Js.log
            )
         |> Future.fork(_ => (), _ => ())
       )
    |> Future.fork(_ => (), _ => ());
  ();
};

main();