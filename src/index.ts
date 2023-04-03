require('dotenv').config();
import express from "express";
import cors from "cors";
import Auth from "./routes/Auth"
import UsersRouter from "./routes/User"
const app = express();

app.use(
    cors({
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);

// app.use("/", mainRoute);
app.use("/auth", Auth);
app.use("/user", UsersRouter);

app.listen(process.env.PORT || 5000);