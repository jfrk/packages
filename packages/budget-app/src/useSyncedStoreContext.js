import { useContext } from "react";

import syncedStoreContext from "./syncedStoreContext";

export default function useSyncedStoreContext() {
  return useContext(syncedStoreContext);
}
