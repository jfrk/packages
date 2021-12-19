# @jfrk/ink-router

Router for [ink](https://github.com/vadimdemedes/ink) based on
[@reach/router](https://github.com/reach/router).

## How to use

Wrap your Ink app in `<ServerLocation url="...">` and then use `<Router>` the
same way as in Reach Router;

## Example

```js
// cli.js

import { ServerLocation } from "@jfrk/ink-router";
import { render } from "ink";
import meow from "meow";
import qs from "query-string";
import React from "react";

import App from "./App.js";

const cli = meow(`
  Usage
    $ example-cli counter <start>

  Options
    --interval  Milliseconds between increments

  Examples
    $ example-cli counter 1 --interval=1000
`);

let url =
  "/" +
  cli.input.map(encodeURIComponent).join("/") +
  "?" +
  qs.stringify(cli.flags);

render(
  <ServerLocation url={url}>
    <App />
  </ServerLocation>,
);

// App.js
import { Router } from "@jfrk/ink-router";
import React from "react";

import Counter from "./Counter.js";

export default function App() {
  return (
    <Router primary={false}>
      <Counter path="/counter/:start" />
    </Router>
  );
}

// Counter.js
import { useLocation } from "@jfrk/ink-router";
import { render, Text } from "ink";
import qs from "query-string";
import React, { useState, useEffect } from "react";

export default function Counter ({start}) {
  const { search } = useLocation();
  const { interval = 100 } = qs.parse(search);
  const [counter, setCounter] = useState(start);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((previousCounter) => previousCounter + 1);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [interval]);

  return <Text color="green">{counter} tests passed</Text>;
};
```
