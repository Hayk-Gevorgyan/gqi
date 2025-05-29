try {
  // chrome.runtime.onConnectExternal.addListener((port) => {
  //   console.info("CONNECT", port);
  //   port.onDisconnect.addListener(() => {
  //     console.info("DISCONNECT", port);
  //   });
  // });
  chrome.devtools.panels.create("GQI", "/icons/16.png", "index.html", (panel) => {
    // console.info(panel.show());
  });
} catch (e) {
  console.error(e);
}
export {};
