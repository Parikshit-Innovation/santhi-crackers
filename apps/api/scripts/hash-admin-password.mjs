import { randomBytes, scryptSync } from "node:crypto";

const input = process.stdin;
if (!input.isTTY || typeof input.setRawMode !== "function") {
  console.error(
    "Run this command in an interactive terminal so the password can be entered without echo.",
  );
  process.exitCode = 1;
} else {
  let password = "";
  let finished = false;
  process.stdout.write("Admin password (minimum 12 characters): ");
  input.setRawMode(true);
  input.resume();

  const finish = () => {
    if (finished) return;
    finished = true;
    input.setRawMode(false);
    input.pause();
    process.stdout.write("\n");

    if (password.length < 12 || password.length > 256) {
      console.error("Password must contain between 12 and 256 characters.");
      process.exitCode = 1;
      password = "";
      return;
    }

    const salt = randomBytes(16);
    const key = scryptSync(password, salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });
    process.stdout.write(
      `ADMIN_PASSWORD_HASH=scrypt$${salt.toString("hex")}$${key.toString("hex")}\n`,
    );
    password = "";
  };

  input.on("data", (chunk) => {
    for (const character of chunk.toString("utf8")) {
      if (character === "\u0003") {
        password = "";
        finish();
        process.exitCode = 1;
        return;
      }
      if (character === "\r" || character === "\n") {
        finish();
        return;
      }
      if (character === "\u007f" || character === "\b") {
        password = password.slice(0, -1);
        continue;
      }
      if (character >= " ") password += character;
    }
  });
}
