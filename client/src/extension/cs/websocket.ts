import Port = chrome.runtime.Port;

class GqiWebSocket extends WebSocket {
  static #sockets = new Set<GqiWebSocket>;
  static #getHostExtensionId() {
    let [, line] = new Error().stack.toString().split("\n");
    let [, eid] = line.match(/chrome-extension:\/\/([a-z0-9]+)\//);
    return eid;
  }
  static PROTOCOL = "graphql-transport-ws";
  static isGraphQlProtocol(protocol: string | string[]) {
    if (!protocol) {
      return false;
    }
    if (Array.isArray(protocol)) {
      return protocol.includes(GqiWebSocket.PROTOCOL);
    }
    return protocol === GqiWebSocket.PROTOCOL;
  }
  #session: number;
  #gqi: Port;
  #messages: any[];
  #isGql: boolean;
  #seq: number;
  constructor(url: string | URL, protocols: string | string[]) {
    super(url, protocols);
    this.#isGql = GqiWebSocket.isGraphQlProtocol(protocols);
    this.#seq = 0;
    this.#init();
  }
  send(data: string) {
    if (this.#isGql) {
      this.#emit({
        type: "outgoing",
        data: JSON.parse(data)
      });
    }
    super.send(data);
  }
  close(code?: number, reason?: string) {
    if (this.#isGql) {
      this.#emit({
        type: "close",
        data: { code, reason }
      });
    }
    super.close(code, reason);
  }
  #init() {
    if (this.#isGql) {
      this.#messages = [];
      this.#session = Date.now();
      this.addEventListener("open", (event) => {
        GqiWebSocket.#sockets.add(this);
        this.#emit({
          type: "open",
          data: {
            url: this.url,
            session: this.#session,
            protocol: this.protocol
          }
        });
      });
      this.addEventListener("close", (event) => {
        GqiWebSocket.#sockets.delete(this);
        this.#emit({
          type: "close",
          data: {
            code: event.code,
            reason: event.reason
          }
        });
      });
      this.addEventListener("error", (event) => {
        this.#emit({
          type: "error"
        });
      });
      this.addEventListener("message", (event) => {
        this.#emit({
          type: "incoming",
          data: JSON.parse(event.data)
        });
      });
      this.#connect();
    }
  }
  #emit(detail) {
    const data = {
      seq: this.#seq++,
      time: Date.now(),
      ...detail
    };
    this.#messages.push(data);
    if (this.#gqi) {
      this.#gqi.postMessage(data);
    }
  }
  #connect() {
    try {
      const port = chrome.runtime.connect(GqiWebSocket.#getHostExtensionId(), {
        name: `WS${this.#session}`
      });
      port.onDisconnect.addListener(() => {
        this.#gqi = null;
      });
      port.onMessage.addListener((msg) => {
        if (msg.type == "init") {
          this.#gqi = port;
          for (let m of this.#messages) {
            this.#gqi.postMessage(m);
          }
        }
      });
    } catch (ex) {
      //
    }
  }
  static {
    Object.assign(window, {
      WebSocket: GqiWebSocket,
      __gqi_init: () => {
        for (let s of GqiWebSocket.#sockets) {
          s.#connect();
        }
      }
    });
  }
}
export {}
