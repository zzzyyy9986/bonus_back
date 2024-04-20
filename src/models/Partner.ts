import { model, Schema } from "mongoose";
import * as mongoose from "mongoose";

export const parthnersShema: Schema = new Schema(
  {
    name: String,
    percent: Number,
  },
  {
    strict: false,
    collection: "partners",
  },
);

export const Partner = model("Partner", parthnersShema);
