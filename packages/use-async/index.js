import { useState, useEffect } from "react";

export default function useAsync(maker, deps) {
  const [state, setState] = useState({});

  const { result, error } = state;
  const isResolved = Object.prototype.hasOwnProperty.call(state, "result");
  const isRejected = Object.prototype.hasOwnProperty.call(state, "error");

  useEffect(() => {
    if (isResolved || isRejected) {
      setState({});
    }
    maker()
      .then((result) => {
        setState({ result });
      })
      .catch((error) => {
        setState({ error });
      });
  }, deps);

  const isPending = !isResolved && !isRejected;

  return {
    isResolved,
    isPending,
    isRejected,
    result,
    error,
  };
}
