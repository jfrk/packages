import { syncedStore, getYjsValue } from "@syncedstore/core";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";

export function createStore({
  room,
  types,
  webrtc,
  websocket: { url: websocketURL, ...websocketOptions } = {},
}) {
  const store = syncedStore(types);

  const doc = getYjsValue(store);
  const webrtcProvider =
    room && webrtc && new WebrtcProvider(room, doc, webrtc);

  const websocketProvider =
    room &&
    websocketURL &&
    new WebsocketProvider(websocketURL, room, doc, websocketOptions);

  const indexeddbProvider = new IndexeddbPersistence(room, doc);

  return store;
}
