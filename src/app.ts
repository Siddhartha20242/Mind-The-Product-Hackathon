import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.pendo.io"],
        connectSrc: ["'self'", "https://app.pendo.io"],
      },
    },
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

export default app;
