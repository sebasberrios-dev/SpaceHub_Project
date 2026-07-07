import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { createHandler } from "graphql-http/lib/use/express";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./docs/openapi";
import { schema } from "./graphql/schema";
import authRoutes from "./routes/auth.routes";
import spacesRoutes from "./routes/spaces.routes";
import reservationsRoutes from "./routes/reservations.routes";
import membershipsRoutes from "./routes/memberships.routes";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");

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

function getUser(authHeader?: string | null) {
  if (!authHeader) return null;
  try {
    return jwt.verify(authHeader.replace("Bearer ", ""), JWT_SECRET!) as any;
  } catch {
    return null;
  }
}

app.use(
  "/api/graphql",
  createHandler({
    schema,
    context: (req) => ({
      user: getUser(req.raw.headers.authorization),
    }),
  }),
);

const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/api/graphql",
});
useServer(
  {
    schema,
    context: (ctx) => ({
      user: getUser(
        (ctx.connectionParams?.Authorization ??
          ctx.connectionParams?.authorization) as string | undefined,
      ),
    }),
  },
  wsServer,
);

app.use((req, res) => {
  res.status(404).json({ error: "route not found" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  },
);

httpServer.listen(PORT, () => {
  console.log(`SpaceHub API running on port ${PORT}`);
  console.log(`GraphQL HTTP:  http://localhost:${PORT}/api/graphql`);
  console.log(`GraphQL WS:   ws://localhost:${PORT}/api/graphql`);
});

export default app;
