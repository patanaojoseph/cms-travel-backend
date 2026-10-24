import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a headline title"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxLength: [200, "Subtitle cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    mediaType: {
      type: String,
      enum: ["video", "image"],
      default: "video",
    },
    media: {
      public_id: {
        type: String,
        required: [true, "Please provide media public ID"],
      },
      url: {
        type: String,
        required: [true, "Please provide media URL"],
      },
    },
    ctaText: {
      type: String,
      trim: true,
      default: "Explore Destinations",
    },
    ctaLink: {
      type: String,
      trim: true,
      default: "#plan",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

heroSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Hero || mongoose.model("Hero", heroSchema);
