# Threaded jank test

> Tests async JS vs threaded js web worker styley

Uses `requestAnimationFrame`, `addEventListener` and `performance` so check your browser compatibility.

[Example](https://mattstyles.github.io/thread-jank-test)

__Why?__

Whilst the async version does chuck out a load of promises and waits for them to resolve the actual work is synchronous, plus, JS is single-threaded so even if it jumped between processes the total time is still going to be the same as daisy-chaining them together (with a slight variance for swapping contexts etc etc)

Web workers spawn separate threads that run outside (or alongside) of the main JS thread, meaning that work done here does not _block_ the main thread and interrupt the JS-powered animation. The slight jank (almost unnoticeable on high powered machines with the console closed in most browsers) is the web worker firing up.

With low levels of concurrency and small workloads the effort to spawn new workers outweighs the actual work being done although if you are doing enough small tasks continuously you will experience jank and you’d have to decide between actual performance and perceived performance.
