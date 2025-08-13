import express, { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./generated/routes";
import * as swaggerJson from "./generated/swagger.json";

const app: Application = express();

app.use(express.json());

// Add a root route that redirects to /docs
app.get("/", (req, res) => {
  res.redirect("/docs");
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

RegisterRoutes(app);

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Required for Google Cloud Run

app.listen(Number(PORT), HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
