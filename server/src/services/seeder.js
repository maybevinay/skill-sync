import { User } from "../models/User.js";
import { Skill } from "../models/Skill.js";
import { Profile, MentorProfile } from "../models/Profile.js";
import { MatchRequest } from "../models/MatchRequest.js";
import { Counter } from "../models/Counter.js";

const CATALOG_SKILLS = [
  { name: "Spring Boot", category: "Backend", description: "Build production REST APIs with Spring Boot 3" },
  { name: "React", category: "Frontend", description: "Component-driven UI with React" },
  { name: "TypeScript", category: "Frontend", description: "Typed JavaScript at scale" },
  { name: "MySQL", category: "Database", description: "Relational modeling and query optimization" },
  { name: "System Design", category: "Architecture", description: "Scalable service design" },
  { name: "Machine Learning", category: "AI", description: "Supervised learning fundamentals" },
  { name: "Python", category: "Backend", description: "Scripting, APIs, and data work" },
  { name: "Docker", category: "DevOps", description: "Containerize and ship services" },
  { name: "Kubernetes", category: "DevOps", description: "Orchestrate cloud-native workloads" },
  { name: "Communication", category: "Soft Skills", description: "Mentoring and stakeholder communication" },
  { name: "Node.js", category: "Backend", description: "High-performance JavaScript backend APIs with Express" },
  { name: "MongoDB", category: "Database", description: "Document-oriented NoSQL database modeling and aggregation" },
];

export async function seedDatabase() {
  // 1. Seed Skills
  const existingSkills = await Skill.countDocuments();
  if (existingSkills === 0) {
    let skillSeq = 1;
    for (const item of CATALOG_SKILLS) {
      await Skill.create({ id: skillSeq++, ...item });
    }
    await Counter.findByIdAndUpdate("skill", { seq: CATALOG_SKILLS.length }, { upsert: true });
    console.log(`[Seeder] Seeded ${CATALOG_SKILLS.length} skills.`);
  }

  const allSkills = await Skill.find().sort({ id: 1 });

  // 2. Seed Users
  async function seedUser(id, name, email, password, role) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return existing;

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      id,
      fullName: name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      enabled: true,
      emailVerified: true,
    });
    console.log(`[Seeder] Seeded user ${email} (${role})`);
    return user;
  }

  await seedUser(1, "Amit Admin", "admin@skillsync.dev", "Admin@12345", "ADMIN");
  await seedUser(2, "Maya Mentor", "mentor@skillsync.dev", "Mentor@12345", "MENTOR");
  await seedUser(3, "Uma User", "user@skillsync.dev", "User@12345", "USER");
  await seedUser(9004, "Leo Backend", "leo@skillsync.dev", "Mentor@12345", "MENTOR");
  await seedUser(9005, "Priya Cloud", "priya@skillsync.dev", "Mentor@12345", "MENTOR");

  await Counter.findByIdAndUpdate("user", { $max: { seq: 3 } }, { upsert: true });

  // 3. Seed Profiles & MentorProfiles
  async function seedProfile({
    userId,
    profileId,
    mentorProfileId,
    name,
    bio,
    goals,
    years,
    country,
    isMentor,
    skillIndices,
    headline,
    rating,
    reviewCount,
    availability = "FLEXIBLE",
  }) {
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      const pSkills = [];
      for (const idx of skillIndices) {
        if (allSkills[idx]) {
          pSkills.push({
            skillId: allSkills[idx].id,
            level: isMentor ? "EXPERT" : "INTERMEDIATE",
            progress: isMentor ? 90 : 40,
          });
        }
      }
      profile = await Profile.create({
        id: profileId,
        userId,
        fullName: name,
        bio,
        learningGoals: goals,
        experienceYears: years,
        country,
        availability,
        githubUrl: "https://github.com/skillsync",
        skills: pSkills,
      });
      console.log(`[Seeder] Seeded profile for ${name}`);
    }

    if (isMentor) {
      let mp = await MentorProfile.findOne({ profileId: profile.id });
      if (!mp) {
        mp = await MentorProfile.create({
          id: mentorProfileId,
          profileId: profile.id,
          userId,
          headline: headline || bio,
          rating: rating || 4.7,
          reviewCount: reviewCount || 10,
          accepting: true,
        });
        console.log(`[Seeder] Seeded mentor profile for ${name}`);
      }
    }
  }

  await seedProfile({
    userId: 2,
    profileId: 1,
    mentorProfileId: 1,
    name: "Maya Mentor",
    bio: "Staff engineer mentoring Spring and React.",
    goals: "Help others ship production systems",
    years: 8,
    country: "India",
    isMentor: true,
    skillIndices: [0, 1, 2, 3],
    headline: "Staff engineer mentoring Spring, React, and System Design",
    rating: 4.7,
    reviewCount: 12,
  });

  await seedProfile({
    userId: 3,
    profileId: 2,
    mentorProfileId: null,
    name: "Uma User",
    bio: "Frontend engineer learning backend.",
    goals: "Spring Boot, System Design",
    years: 2,
    country: "India",
    isMentor: false,
    skillIndices: [1, 2],
    availability: "WEEKNIGHTS",
  });

  await seedProfile({
    userId: 9004,
    profileId: 3,
    mentorProfileId: 2,
    name: "Leo Backend",
    bio: "Distributed systems mentor.",
    goals: "Career growth in backend",
    years: 11,
    country: "Germany",
    isMentor: true,
    skillIndices: [0, 3, 4, 7],
    headline: "Distributed systems and scalable architecture mentor",
    rating: 4.85,
    reviewCount: 24,
  });

  await seedProfile({
    userId: 9005,
    profileId: 4,
    mentorProfileId: 3,
    name: "Priya Cloud",
    bio: "DevOps and Kubernetes coach.",
    goals: "Cloud native mentoring",
    years: 9,
    country: "USA",
    isMentor: true,
    skillIndices: [7, 8, 3],
    headline: "DevOps, Kubernetes and Cloud-native infrastructure coach",
    rating: 4.9,
    reviewCount: 18,
  });

  await Counter.findByIdAndUpdate("profile", { $max: { seq: 4 } }, { upsert: true });
  await Counter.findByIdAndUpdate("mentor_profile", { $max: { seq: 3 } }, { upsert: true });

  // 4. Seed accepted demo request Uma -> Maya
  const umaProfile = await Profile.findOne({ userId: 3 });
  const mayaMentor = await MentorProfile.findOne({ userId: 2 });
  if (umaProfile && mayaMentor) {
    const existingReq = await MatchRequest.findOne({ learnerUserId: 3, mentorId: mayaMentor.id });
    if (!existingReq) {
      await MatchRequest.create({
        id: 1,
        learnerId: umaProfile.id,
        learnerUserId: 3,
        mentorId: mayaMentor.id,
        message: "I'd like help with Spring Boot and system design.",
        status: "ACCEPTED",
      });
      await Counter.findByIdAndUpdate("match_request", { $max: { seq: 1 } }, { upsert: true });
      console.log("[Seeder] Seeded accepted demo request Uma -> Maya.");
    }
  }
}
