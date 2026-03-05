import axios from "axios";
import env from "../config/env.loader.js";

const BASE_URL = `http://localhost:${env.PORT}`;
const API_URL = `${BASE_URL}/api/v1`;

const apiTests = [
  { method: "GET", path: "/health", name: "Health Check" },
  { method: "POST", path: "/auth/register", name: "Auth - Register" },
  { method: "POST", path: "/auth/login", name: "Auth - Login" },
  { method: "POST", path: "/auth/firebase", name: "Auth - Firebase Login" },
  { method: "POST", path: "/auth/refresh", name: "Auth - Refresh Token" },
  { method: "GET", path: "/auth/me", name: "Auth - Get Me" },
  { method: "GET", path: "/users/profile", name: "User - Get Profile" },
  { method: "PUT", path: "/users/profile", name: "User - Update Profile" },
  { method: "GET", path: "/professionals", name: "Professionals - List" },
  { method: "GET", path: "/bookings", name: "Bookings - List" },
  { method: "POST", path: "/bookings", name: "Bookings - Create" },
  { method: "GET", path: "/reviews", name: "Reviews - List" },
  { method: "POST", path: "/reviews", name: "Reviews - Create" },
  { method: "GET", path: "/availability", name: "Availability - Check" },
  { method: "GET", path: "/enquiries", name: "Enquiries - List" },
  { method: "POST", path: "/enquiries", name: "Enquiries - Create" },
  { method: "GET", path: "/chats", name: "Chats - List" },
  { method: "GET", path: "/notifications", name: "Notifications - List" },
  { method: "GET", path: "/search", name: "Search" },
  { method: "GET", path: "/feed", name: "Feed - Get Posts" },
  { method: "GET", path: "/social/followers", name: "Social - Followers" },
];

async function testAPI(method, path, name) {
  let url = `${API_URL}${path}`;
  if (method !== "POST") {
    url += path.includes("?") ? "&test=API_TEST" : "?test=API_TEST";
  }
  const start = process.hrtime();
  try {
    const config = {
      method,
      url,
      timeout: 3000,
      validateStatus: () => true,
    };
    if (method === "POST") {
      config.data = { test: "API_TEST" };
      config.headers = { "Content-Type": "application/json" };
    }
    const response = await axios(config);
    const diff = process.hrtime(start);
    const ms = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3);
    let symbol, color;
    if (response && response.data === "OK") {
      symbol = "✓";
      color = "\x1b[32m";
    } else if (
      method === "GET" &&
      response &&
      typeof response.data === "object" &&
      (response.data.success === true || response.data.ok === true)
    ) {
      symbol = "✓";
      color = "\x1b[32m";
    } else {
      symbol = "✗";
      color = "\x1b[31m";
    }

    return {
      ok: symbol === "✓",
      symbol,
      color,
      name,
      ms: `${ms} ms`,
      methodPath: `${method} /api/${env.API_VERSION}${path}`,
    };
  } catch (err) {
    return {
      ok: false,
      symbol: "✗",
      color: "\x1b[31m",
      name,
      ms: "0.000 ms",
      methodPath: `${method} /api/${env.API_VERSION}${path}`,
    };
  }
}

async function runTests() {
  console.log("\n========================================");
  console.log("🧪 API Endpoint Tests");
  console.log("========================================\n");

  const results = [];
  for (const test of apiTests) {
    const r = await testAPI(test.method, test.path, test.name);
    results.push(r);
  }

  const col1 = results.map((r) => `${r.symbol} ${r.name}`);
  const col2 = results.map((r) => r.ms);
  const col1Width = Math.max(...col1.map((s) => s.length));
  const col2Width = Math.max(...col2.map((s) => s.length));

  let passed = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const left = `${r.symbol} ${r.name}`.padEnd(col1Width);
    const mid = r.ms.padEnd(col2Width);
    const line = `${left} | ${mid} | ${r.methodPath}`;
    console.log(`${r.color}${line}\x1b[0m`);
    if (r.ok) passed++;
  }

  console.log("\n========================================");
  console.log(`Tests: ${passed}/${apiTests.length} passed`);
  console.log("========================================\n");
}

export { runTests };
