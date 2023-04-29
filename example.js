import { EventEmitter } from "node:events";
import { chain } from "./index.js";

class Parser extends EventEmitter {
  async whoami() {
    const body = await chain().fetch("https://httpbin.org/anything").json();

    this.emit("request", body.method, body.url);
    this.emit("ip", body.origin);

    for (let [name, value] of Object.entries(body.headers)) {
      this.emit("header", name, value);
    }

    return body;
  }
}

(async () => {
  const ip = await chain(new Parser())
    .on("request", (method, url) => console.log(`${method} ${url}`))
    .on("header", (name, value) => console.log(` > ${name}: ${value}`))
    .whoami()
    .origin.pipe((origin) => origin);

  console.log(ip);
})();
