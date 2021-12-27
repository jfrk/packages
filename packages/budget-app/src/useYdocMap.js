import { useEffect, useMemo, useRef, useState } from "react";

import useYdocContext from "./useYdocContext";

export default function useYdocMap(type) {
  const { ydoc } = useYdocContext();
  const observerRef = useRef();
  const [json, setJson] = useState();
  const ymap = useMemo(() => {
    let ymap = ydoc.getMap(type);
    if (observerRef.current) {
      ymap.unobserveDeep(observerRef.current);
    }
    observerRef.current = (event, transaction) => {
      setJson(ymap.toJSON());
    };
    ymap.observeDeep(observerRef.current);
    return ymap;
  }, [type]);

  return ymap;
}
