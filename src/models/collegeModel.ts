import { Schema, model } from "mongoose";

// Interface for College document
export interface ICollegeName extends Document {
  university?: string;
  college?: string;
  college_type?: string;
  state?: string;
  district?: string;
}

// Schema for College document
const collegeNameSchema = new Schema<ICollegeName>(
  {
    university: { type: String, trim: true },
    college: { type: String, trim: true },
    college_type: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
  },
  { timestamps: true }
);

// Model for College document
const College = model<ICollegeName>("College", collegeNameSchema);

export default College;
