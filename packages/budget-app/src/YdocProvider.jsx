import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import ydocContext from "./ydocContext";

YdocProvider.propTypes = {
  children: PropTypes.node,
  room: PropTypes.string,
  webrtc: PropTypes.object,
  websocket: PropTypes.object,
};

export default function YdocProvider({
  children,
  room,
  webrtc,
  websocket: { url: websocketURL, ...websocketOptions } = {},
}) {
  let ydoc;
  let webrtcProvider;
  let websocketProvider;
  let indexeddbProvider;

  const { Provider } = ydocContext;

  const ydocRef = useRef();
  const webrtcProviderRef = useRef();
  const websocketProviderRef = useRef();
  const indexeddbProviderRef = useRef();

  const [ready, setReady] = useState(true);

  if (!ydocRef.current) {
    ydoc = ydocRef.current = new Y.Doc();

    // clients connected to the same room-name share document updates
    webrtcProvider = webrtcProviderRef.current =
      room && webrtc && new WebrtcProvider(room, ydoc, webrtc);

    websocketProvider = websocketProviderRef.current =
      room &&
      websocketURL &&
      new WebsocketProvider(websocketURL, room, ydoc, websocketOptions);

    indexeddbProvider = indexeddbProviderRef.current = new IndexeddbPersistence(
      room,
      ydoc,
    );

    indexeddbProvider.on("synced", () => {
      console.log("content from the database is loaded");
    });

    // setReady(true);
  } else {
    ydoc = ydocRef.current;
    webrtcProvider = webrtcProviderRef.current;
    websocketProvider = websocketProviderRef.current;
    indexeddbProvider = indexeddbProviderRef.current;
  }

  // useEffect(() => {
  //   () => {
  //     if (webrtcProviderRef.current) {
  //       webrtcProviderRef.current.destroy();
  //     }
  //   };
  // }, []);

  const value = {
    ready,
    ydoc,
    webrtcProvider,
    websocketProvider,
  };

  return <Provider value={value}>{children}</Provider>;
}
