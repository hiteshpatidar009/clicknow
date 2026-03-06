import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: "twilio",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// Auto-delete expired OTPs.
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpCode = mongoose.model("OtpCode", otpCodeSchema);
export default OtpCode;
