import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// CI compares the proposed branch with its counterpart. Override for local worktrees.
const current = JSON.parse(readFileSync("package.json", "utf8"));
const auth = Boolean(current.dependencies.pg);
const other =
  process.argv[2] || `origin/${auth ? "main" : "template-with-auth"}`;
const readOther = (path) =>
  execFileSync("git", ["show", `${other}:${path}`], { encoding: "utf8" });
const shared = JSON.parse(readFileSync("scripts/shared-files.json", "utf8"));
const failures = shared.filter(
  (path) => readFileSync(path, "utf8") !== readOther(path),
);
const counterpart = JSON.parse(readOther("package.json"));
for (const section of ["dependencies", "devDependencies", "scripts"]) {
  const variantOnly = new Set(
    section === "dependencies"
      ? ["pg", "nodemailer", "server-only"]
      : section === "devDependencies"
        ? ["@types/pg", "@types/nodemailer"]
        : ["start", "db:bootstrap-entities", "test:db"],
  );
  for (const key of new Set([
    ...Object.keys(current[section]),
    ...Object.keys(counterpart[section]),
  ])) {
    if (
      !variantOnly.has(key) &&
      current[section][key] !== counterpart[section][key]
    )
      failures.push(`${section}.${key}`);
  }
}
for (const key of ["packageManager", "engines"]) {
  if (JSON.stringify(current[key]) !== JSON.stringify(counterpart[key]))
    failures.push(key);
}
if (failures.length) {
  console.error(
    `Template drift against ${other}:\n${failures.join("\n")}\nMerge shared changes into both variants before release.`,
  );
  process.exitCode = 1;
} else console.log(`Shared files, tooling and dependencies match ${other}.`);
