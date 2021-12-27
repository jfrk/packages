import { useContext } from "react";

import ydocContext from "./ydocContext";

export default function useYdocContext() {
  return useContext(ydocContext);
}
