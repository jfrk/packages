import { exec } from "child_process";
import { promisify } from "util";

import { useLocation } from "@jfrk/ink-router";
import useAsync from "@jfrk/use-async";
import { Text } from "ink";
import qs from "query-string";
import React from "react";
const execAsync = promisify(exec);

import create from "../actions/create.js";

import Spinner from "./Spinner.js";

export default function Create({ sourceFile }) {
  const { search } = useLocation();
  const { ...options } = qs.parse(search, { parseBooleans: true });

  const { result, isPending, error } = useAsync(async () => {
    let result = await create(sourceFile, options);
    execAsync(`open ${result.targetPath}`);
    return result;
  }, [sourceFile]);

  if (error) {
    return <Text color="red">{error.toString()}</Text>;
  }

  if (isPending) {
    return (
      <Text>
        <Spinner type="dots" />
        {" Creating shadow..."}
      </Text>
    );
  }

  return <Text color="green">✓ Shadow created: {result.targetPath}</Text>;
}
