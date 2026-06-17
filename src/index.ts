import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./docs/openapi";
import authRoutes from "./routes/auth.routes";
import spacesRoutes from "./routes/spaces.routes";
import reservationsRoutes from "./routes/reservations.routes";
import membershipsRoutes from "./routes/memberships.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SpaceHub API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/spaces", spacesRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/memberships", membershipsRoutes);

app.listen(PORT, () => {
  console.log(`SpaceHub API running on port ${PORT}`);
});

export default app;
