import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true, // ENHANCEMENT: Auto-lowercase emails
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Please provide your message"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
    },
  },
  { timestamps: true },
);

inquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Inquiry ||
  mongoose.model("Inquiry", inquirySchema);
