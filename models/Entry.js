import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityType: String,
  projectName: String,
  reflections: Array,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Entry || mongoose.model("Entry", EntrySchema);
