import { model, Schema } from "mongoose";
import * as mongoose from "mongoose";

export const userShema: Schema = new Schema(
  {
    fullName: String,
    balance: Number,
  },
  {
    strict: false,
  },
);

export const User = model("User", userShema);
