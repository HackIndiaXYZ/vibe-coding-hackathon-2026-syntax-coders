import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { adminRouter } from "./modules/admin/admin.routes";
import { aiRouter } from "./modules/ai/ai.routes";
import { appointmentsRouter } from "./modules/appointments/appointments.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { doctorsRouter } from "./modules/doctors/doctors.routes";
import { healthRouter } from "./modules/health/health.routes";
import { reportsRouter } from "./modules/reports/reports.routes";
import { syncRouter } from "./modules/sync/sync.routes";
import { errorHandler } from "./shared/error-handler";

export const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading static images/PDFs across origins
}));
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/reports", reportsRouter);
app.use("/ai", aiRouter);
app.use("/admin", adminRouter);
app.use("/doctors", doctorsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/sync", syncRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path
  });
});

app.use(errorHandler);
