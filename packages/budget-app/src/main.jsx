import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App.jsx";
import { createStore } from "./store";
import SyncedStoreProvider from "./SyncedStoreProvider.jsx";

const store = createStore({
  types: { app: {} },
  room: import.meta.env.VITE_YDOC_ROOM,
  webrtc: {
    password: import.meta.env.VITE_YDOC_WEBRTC_PASSWORD,
    // signaling: toArray(import.meta.env.VITE_YDOC_WEBRTC_SIGNALING),
  },
});

// function toArray(string) {
//   return string
//     .split(/,\s*/)
//     .map((value) => value.trim())
//     .filter(Boolean);
// }

localStorage.log = true;

ReactDOM.render(
  <React.StrictMode>
    <SyncedStoreProvider
      store={store}
      // types={{ app: {} }}
      // room={import.meta.env.VITE_YDOC_ROOM}
      // webrtc={{
      //   password: import.meta.env.VITE_YDOC_WEBRTC_PASSWORD,
      //   // signaling: toArray(import.meta.env.VITE_YDOC_WEBRTC_SIGNALING),
      // }}
      // websocket={{
      //   url: import.meta.env.VITE_YDOC_WEBSOCKET_URL,
      // }}
    >
      <App />
    </SyncedStoreProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
