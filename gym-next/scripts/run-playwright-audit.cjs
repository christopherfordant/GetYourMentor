const { spawn } = require("node:child_process");
const http = require("node:http");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const pwCmd = isWindows ? "node_modules\\.bin\\playwright.cmd" : "./node_modules/.bin/playwright";
const headed = process.argv.includes("--headed");
const port = 3001;
const url = `http://127.0.0.1:${port}`;

function waitForServer(targetUrl, timeoutMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(targetUrl, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server responded with status ${res.statusCode}`));
        } else {
          setTimeout(check, 1000);
        }
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for ${targetUrl}`));
        } else {
          setTimeout(check, 1000);
        }
      });
    };
    check();
  });
}

function isServerUp(targetUrl) {
  return new Promise((resolve) => {
    const req = http.get(targetUrl, (res) => {
      res.resume();
      resolve(Boolean(res.statusCode && res.statusCode < 500));
    });
    req.on("error", () => resolve(false));
  });
}

function terminate(proc) {
  if (!proc || proc.killed) return;
  if (isWindows) {
    spawn("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  proc.kill("SIGTERM");
}

async function main() {
  let dev = null;
  const serverAlreadyRunning = await isServerUp(url);

  if (!serverAlreadyRunning) {
    dev = spawn(npmCmd, ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
      stdio: "inherit",
      shell: isWindows,
    });
  } else {
    console.log(`[pw:audit] Serveur detecte sur ${url}, reutilisation du serveur existant.`);
  }

  const cleanup = () => terminate(dev);
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  try {
    await waitForServer(url);

    const args = ["test", "tests/visual-audit.spec.ts"];
    if (headed) args.push("--headed");

    const pw = spawn(pwCmd, args, {
      stdio: "inherit",
      shell: isWindows,
    });

    const exitCode = await new Promise((resolve) => {
      pw.on("close", resolve);
    });

    cleanup();
    process.exit(exitCode ?? 1);
  } catch (error) {
    console.error("[pw:audit] ", error.message);
    cleanup();
    process.exit(1);
  }
}

main();
