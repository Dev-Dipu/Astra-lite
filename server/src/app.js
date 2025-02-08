import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import "./config/google-auth.js";
import logger from "./middlewares/logger.middlewares.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        
    })
);

// common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(logger);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import snippetRouter from "./routes/snippet.routes.js";
import pixelpenRouter from "./routes/pixelpen.routes.js";
import serviceRouter from "./routes/service.routes.js";
import googleAuth from "./routes/auth.routes.js"
import errorHandler from "./middlewares/error.middlewares.js";

// routes
app.use("/auth/google", googleAuth)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/snippets", snippetRouter);
app.use("/api/v1/pixelpens", pixelpenRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/healthcheck", healthCheckRouter);

app.use(errorHandler);
export default app;
