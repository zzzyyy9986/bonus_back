import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { makeApiRequest } from "./main";
import { DB_NAME, DB_PORT, NODE_MONGO_PORT } from "./env";
import * as mongoose from "mongoose";

dotenv.config();

const app: Express = express();
const port = 8080;
var cors = require("cors");
let corsOptions = {};
corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
const dbUrl = `mongodb://localhost:${DB_PORT}/${DB_NAME}`;

mongoose
  .connect(dbUrl)
  .then(() => {
    app.listen(NODE_MONGO_PORT, () => {});
    console.log("Connected");
  })
  .catch((err) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server3");
});
app.get("/nalog", (req: Request, res: Response) => {
  console.log("ff");
  makeApiRequest(req, res);
});
app.post("/nalog", (req: Request, res: Response) => {
  makeApiRequest(req, res);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
