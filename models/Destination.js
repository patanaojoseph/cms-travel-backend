import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide destination name"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    location: {
      region: {
        type: String,
        required: [true, "Please provide a region or state"],
      },
      country: { type: String, required: [true, "Please provide a country"] }, // Removed default: "Philippines"
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: {
        values: [
          "Beach",
          "Mountain",
          "Cultural",
          "Historical",
          "City",
          "Adventure",
        ],
        message: "Please select a valid category",
      },
    },
    shortDescription: {
      type: String,
      required: [true, "Please provide a short summary for cards"],
      maxLength: [300, "Summary cannot exceed 300 characters"],
    },
    fullContent: {
      type: String,
      required: [true, "Please provide full destination details"],
    },
    featuredImage: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    gallery: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    bestTimeToVisit: { type: String },
    budgetLevel: {
      type: String,
      enum: ["Budget", "Mid-Range", "Luxury"],
      default: "Mid-Range",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes for public filter performance
destinationSchema.index({ category: 1, isFeatured: -1 });
destinationSchema.index({ "location.country": 1 }); // Optional: Helps fast queries by country

// Pre-save Middleware: Automatically generate slug
destinationSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
});

export default mongoose.models.Destination ||
  mongoose.model("Destination", destinationSchema);
