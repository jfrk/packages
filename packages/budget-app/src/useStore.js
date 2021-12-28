import { useSyncedStore } from "@syncedstore/react";

import useSyncedStoreContext from "./useSyncedStoreContext";

export default function useStore() {
  const { store } = useSyncedStoreContext();
  return useSyncedStore(store);
}
