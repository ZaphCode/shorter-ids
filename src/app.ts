import express from "express";
import { userRouter } from "./routes/user.routes";
import { urlRouter } from "./routes/url.routes";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/users", userRouter);
app.use("/url", urlRouter);
