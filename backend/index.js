require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/professional", require("./routes/professional"));
app.use("/api/professional", require("./routes/userInfo"));
app.use("/api/nutrition-plans", require("./routes/nutritionPlans"));
app.use("/api/training-plans", require("./routes/trainingPlans"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/connections", require("./routes/connections"));
// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
