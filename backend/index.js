const express = require("express");
const app = express();

// Ruta principal
app.get("/", (req, res) => {
  res.send("🚀 App DevOps funcionando");
});

// Ruta de salud (MUY importante en DevOps)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
