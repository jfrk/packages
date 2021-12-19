import { writeFile, readFile, mkdir, access } from "fs/promises";
import { createRequire } from "module";
import { join as joinPath } from "path";

// import { parseAsync, loadOptions } from "@babel/core";
import { Parser } from "acorn";
import acorn_jsx from "acorn-jsx";
import { parse, print, visit } from "recast";

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export default async function (souceFile, { force = false } = {}) {
  const require = createRequire(import.meta.url);
  let [, pkg, file] = souceFile.match(/^(.*?)\/src\/(.*)$/) || [];

  // let packageDir = joinPath(
  //   await require.resolve(joinPath(pkg, "package.json")),
  //   "..",
  // );
  // const sourceRequire = createRequire(source);

  let targetPath = joinPath("src", pkg, file);
  if (!force && (await fileExists(targetPath))) {
    throw new Error("File already exists");
  }

  let source = require.resolve(souceFile);
  let code = String(await readFile(source));
  let ast = parse(code, {
    parser: Parser.extend(acorn_jsx()),
  });

  visit(ast, {
    visitImportDeclaration(path) {
      let { node } = path;
      if (node.source.value.startsWith(".")) {
        node.source.value = joinPath(souceFile, "..", node.source.value);
      }
      this.traverse(path);
    },
  });

  let dir = joinPath(targetPath, "..");
  await mkdir(dir, { recursive: true });

  let output = print(ast).code;
  await writeFile(targetPath, output);

  return { targetPath };
}
