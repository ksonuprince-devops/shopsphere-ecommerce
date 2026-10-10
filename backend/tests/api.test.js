
const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/server");

test("GET / returns application information", async () => {
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.equal(response.body.application, "ShopSphere");
});

test("GET /health returns UP", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "UP");
});

test("GET /api/products returns three products", async () => {
  const response = await request(app).get("/api/products");

  assert.equal(response.status, 200);
  assert.equal(response.body.count, 3);
  assert.equal(response.body.products.length, 3);
});

test("GET /api/products/1 returns Wireless Headphones", async () => {
  const response = await request(app).get("/api/products/1");

  assert.equal(response.status, 200);
  assert.equal(response.body.name, "Wireless Headphones");
});

test("GET /api/products/999 returns 404", async () => {
  const response = await request(app).get("/api/products/999");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Product not found");
});
