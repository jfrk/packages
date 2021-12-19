import { Router } from "@jfrk/ink-router";
import React from "react";

import Create from "./Create.js";

export default function App() {
  return (
    <Router primary={false}>
      <Create path="/create/:sourceFile" />
    </Router>
  );
}
