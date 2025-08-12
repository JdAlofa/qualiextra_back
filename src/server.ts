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

/* Vercel handles the server listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}
Swagger docs available at http://localhost:${PORT}/docs`);
});
*/

export default app;
