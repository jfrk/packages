#!/usr/bin/env node

import { ServerLocation } from "@jfrk/ink-router";
import { render } from "ink";
import meow from "meow";
import qs from "query-string";
import React from "react";

import App from "./ui/App.js";

const cli = meow(
  `
  Usage
    $ gatsby-shadow create <sourceFile>

  Options
    --force, -f  Overwrite existing file
    --open, -o  Open file after creation

  Examples
    $ gatsby-shadow create @jfrk/gatsby-theme-example/src/components/ExampleComponent.js
    Shadow created: src/@jfrk/gatsby-theme-example/components/ExampleComponent.js
`,
  {
    flags: {
      force: {
        type: "boolean",
        alias: "f",
      },
      open: {
        type: "boolean",
        alias: "o",
      },
    },
  },
);

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
