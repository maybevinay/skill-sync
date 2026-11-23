import mongoose from "mongoose";

const profileSkillSchema = new mongoose.Schema(
  {
    skillId: { type: Number, required: true },
    level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      default: "INTERMEDIATE",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    photoUrl: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 800 },
    learningGoals: { type: String, default: null, maxlength: 500 },
    experienceYears: { type: Number, default: 0, min: 0, max: 80 },
    availability: {
      type: String,
      enum: ["WEEKDAYS", "WEEKNIGHTS", "WEEKENDS", "FLEXIBLE"],
      default: "WEEKNIGHTS",
    },
    country: { type: String, default: null, maxlength: 80 },
    linkedinUrl: { type: String, default: null, maxlength: 300 },
    githubUrl: { type: String, default: null, maxlength: 300 },
    portfolioUrl: { type: String, default: null, maxlength: 300 },
    skills: [profileSkillSchema],
  },
  { timestamps: true }
);

const mentorProfileSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    profileId: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    headline: { type: String, required: true, trim: true, maxlength: 160 },
    rating: { type: Number, default: 0.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    accepting: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Profile = mongoose.model("Profile", profileSchema);
export const MentorProfile = mongoose.model("MentorProfile", mentorProfileSchema);
