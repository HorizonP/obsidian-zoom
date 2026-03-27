const { TestEnvironment } = require("jest-environment-node");
const WebSocket = require("ws");

let idSeq = 1;

function getTestPort() {
  const parsedPort = Number.parseInt(
    process.env.ENHANCED_ZOOM_TEST_PORT || "",
    10
  );

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  return 8080;
}

module.exports = class CustomEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    this.callbacks = new Map();

    this.createCommand("applyState");
    this.createCommand("applySettings");
    this.createCommand("applyTestEnvironment");
    this.createCommand("simulateKeydown");
    this.createCommand("executeCommandById");
    this.createCommand("replaceSelection");
    this.createCommand("parseState");
    this.createCommand("getCurrentState");
    this.createCommand("getCurrentViewChromeState");
    this.createCommand("getCurrentHeaderState");
    this.createCommand("getCurrentSharedIndentationState");
  }

  createCommand(type) {
    this.global[type] = (data) => this.runCommand(type, data);
  }

  async initWs() {
    this.ws = new WebSocket(`ws://127.0.0.1:${getTestPort()}`);

    await new Promise((resolve) => this.ws.on("open", resolve));

    this.ws.on("message", (message) => {
      const { id, data, error } = JSON.parse(message);
      const cb = this.callbacks.get(id);
      if (cb) {
        this.callbacks.delete(id);
        cb(error, data);
      }
    });
  }

  async runCommand(type, data) {
    if (!this.ws) {
      await this.initWs();
    }

    return new Promise((resolve, reject) => {
      const id = String(idSeq++);

      this.callbacks.set(id, (error, data) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(data);
        }
      });

      this.ws.send(JSON.stringify({ id, type, data }));
    });
  }

  async teardown() {
    if (this.ws) {
      this.ws.close();
    }
    await super.teardown();
  }
};
