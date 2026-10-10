
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    stock: 25
  },
  {
    id: 2,
    name: "Running Shoes",
    category: "Fashion",
    price: 1999,
    stock: 40
  },
  {
    id: 3,
    name: "Smart Watch",
    category: "Electronics",
    price: 3499,
    stock: 15
  }
];

app.get("/", (req, res) => {
  res.json({
    application: "ShopSphere",
    message: "E-commerce API is running",
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.get("/api/products", (req, res) => {
  res.json({
    count: products.length,
    products
  });
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    item => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      error: "Product not found"
    });
  }

  res.json(product);
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShopSphere API listening on port ${PORT}`);
  });
}
