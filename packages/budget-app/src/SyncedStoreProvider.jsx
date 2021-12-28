// import { syncedStore, getYjsValue } from "@syncedstore/core";
import PropTypes from "prop-types";
// import { useRef } from "react";
// import { IndexeddbPersistence } from "y-indexeddb";
// import { WebrtcProvider } from "y-webrtc";
// import { WebsocketProvider } from "y-websocket";

// import { store } from "./store";
import syncedStoreContext from "./syncedStoreContext";

SyncedStoreProvider.propTypes = {
  children: PropTypes.node,
  store: PropTypes.object.isRequired,
  // room: PropTypes.string,
  // types: PropTypes.object.isRequired,
  // webrtc: PropTypes.object,
  // websocket: PropTypes.object,
};

export default function SyncedStoreProvider({
  children,
  store,
  // room,
  // types,
  // webrtc,
  // websocket: { url: websocketURL, ...websocketOptions } = {},
}) {
  // let store;
  // let doc;
  // let webrtcProvider;
  // let websocketProvider;
  // let indexeddbProvider;

  const { Provider } = syncedStoreContext;

  // const storeRef = useRef();
  // const docRef = useRef();
  // const webrtcProviderRef = useRef();
  // const websocketProviderRef = useRef();
  // const indexeddbProviderRef = useRef();

  // if (!storeRef.current) {
  //   store = storeRef.current = syncedStore(types);
  //   doc = docRef.current = getYjsValue(store);

  //   // clients connected to the same room-name share document updates
  //   console.log("INIT WEBRTC");
  //   webrtcProvider = webrtcProviderRef.current =
  //     room && webrtc && new WebrtcProvider(room, doc, webrtc);

  //   websocketProvider = websocketProviderRef.current =
  //     room &&
  //     websocketURL &&
  //     new WebsocketProvider(websocketURL, room, doc, websocketOptions);

  //   indexeddbProvider = indexeddbProviderRef.current = new IndexeddbPersistence(
  //     room,
  //     doc,
  //   );

  //   indexeddbProvider.on("synced", () => {
  //     console.log("content from the database is loaded");
  //   });

  //   // setReady(true);
  // } else {
  //   store = storeRef.current;
  //   store = docRef.current;
  //   webrtcProvider = webrtcProviderRef.current;
  //   websocketProvider = websocketProviderRef.current;
  //   indexeddbProvider = indexeddbProviderRef.current;
  // }

  // useEffect(() => {
  //   () => {
  //     if (webrtcProviderRef.current) {
  //       webrtcProviderRef.current.destroy();
  //     }
  //   };
  // }, []);

  const value = {
    store,
    // doc,
    // webrtcProvider,
    // websocketProvider,
  };

  return <Provider value={value}>{children}</Provider>;
}
