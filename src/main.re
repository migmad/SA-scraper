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

let rec futures_fold_left = (fn, acc, list, delay) => {
  switch (list) {
  | [] => Future.resolve(acc)
  | [x, ...xs] =>
    x
    |> Future.chain(value => {
         L.debug(m => m("Delaying for %dms", delay));
         Future.after(delay, value);
       })
    |> Future.chain(((_cookies, html)) =>
         html |> Ffi.get_page_images |> Ffi.persist_images_fs
       )
    |> Future.chain(value =>
         futures_fold_left(fn, fn(acc, value), xs, delay)
       )
  };
};

let future_iter = (delay, fn, list) => {
  futures_fold_left(((), v) => fn(v), (), list, delay);
};

let main = () => {
  Logger.setReporter(Logger.format_reporter(~level=Logger.Level.Debug, ()));
  let config_file_path = "./settings.json";
  let delay = 2500; //in miliseconds
  let threadID = 3846392;

  L.info(m => m("Reading config file at %s", config_file_path));
  let _ =
    Ffi.get_thread_essentials(config_file_path, threadID)
    |> Future.chain(thread => {
         L.info(m =>
           m(
             "Got essential thread information.\nThread: %d\nPages: %d",
             thread->Ffi.threadIDGet,
             thread->Ffi.thread_page_countGet,
           )
         );
         generate_computation_list(
           thread->Ffi.cookiesGet,
           thread->Ffi.threadIDGet,
           thread->Ffi.thread_page_countGet,
           [],
         )
         |> future_iter(delay, value =>
              value |> Array.iter(item => L.info(m => m("Persist: %s", item)))
            );
       })
    |> Future.fork(_ => (), _ => L.info(m => m("Done.")));
  ();
};

main();