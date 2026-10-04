// Launcher server Next.js. Dipakai oleh script "dev" dan "start" di package.json:
//   bun src/server.ts dev     -> next dev
//   bun src/server.ts start   -> next start (setelah "bun run build")
// Port dibaca dari APP_PORT di berkas .env (Bun otomatis memuat .env).
import { spawn } from "node:child_process";
import path from "node:path";

const mode = process.argv[2] === "start" ? "start" : "dev";
const port = String(Number(process.env.APP_PORT) || 3000);
const host = process.env.APP_HOST || "0.0.0.0";

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, mode, "--port", port, "--hostname", host], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => child.kill(signal));
}