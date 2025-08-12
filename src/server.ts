import express, { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./generated/routes";

const app: Application = express();

app.use(express.json());

// Add a root route that redirects to /docs
app.get("/", (req, res) => {
  res.redirect("/docs");
});

// Import swagger.json dynamically to ensure it exists
let swaggerDocument;
try {
  swaggerDocument = require("./generated/swagger.json");
} catch (error) {
  console.error("Swagger JSON not found:", error);
  swaggerDocument = { info: { title: "API", version: "1.0.0" }, paths: {} };
}

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

RegisterRoutes(app);

const PORT = process.env.PORT || 3000;

/* Vercel handles the server listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}
Swagger docs available at http://localhost:${PORT}/docs`);
});
*/

export default app;
