import { model, Schema } from "mongoose";
import * as mongoose from "mongoose";

export const historyShema: Schema = new Schema(
  {
    name: String,
    balance: Number,
  },
  {
    strict: false,
  },
);

export const History = model("History", historyShema);
