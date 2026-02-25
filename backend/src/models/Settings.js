import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  commission: {
    globalRate: { type: Number, default: 15 }, // percentage
    // can add overrides per category later
  },
  tax: {
    gstRate: { type: Number, default: 18 },
    serviceTax: { type: Number, default: 0 },
  },
  policies: {
    cancellationWindow: { type: Number, default: 48 }, // hours
    rescheduleLimit: { type: Number, default: 2 },
    refundDays: { type: Number, default: 7 },
  },
  portfolioContent: {
    aboutTitle: { type: String, default: "About ClickNow" },
    aboutText: { type: String, default: "" },
    missionTitle: { type: String, default: "Our Mission" },
    missionText: { type: String, default: "" },
    whyChooseUsTitle: { type: String, default: "Why Choose Us?" },
    whyChooseUsPoints: {
      type: [String],
      default: [
        "Verified and experienced professionals",
        "Transparent pricing with no hidden costs",
        "24/7 customer support",
        "Quality guaranteed on every service",
      ],
    },
    stats: {
      events: { type: String, default: "500+" },
      professionals: { type: String, default: "500+" },
      ratings: { type: String, default: "500+" },
    },
    testimonials: {
      type: [
        {
          id: { type: String },
          name: { type: String },
          location: { type: String },
          rating: { type: Number, min: 0, max: 5, default: 5 },
          message: { type: String },
          avatar: { type: String, default: "" },
        },
      ],
      default: [],
    },
    mediaGallery: {
      type: [
        {
          id: { type: String },
          key: { type: String, default: "" },
          title: { type: String, default: "" },
          category: { type: String, default: "all" },
          type: { type: String, enum: ["image", "video"], default: "image" },
          url: { type: String, default: "" },
          thumbnailUrl: { type: String, default: "" },
          description: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  maintenanceMode: { type: Boolean, default: false },
  version: { type: String, default: '1.0.0' },
}, {
  timestamps: true,
});

// Using a singleton pattern approach where we might only have one document
const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
