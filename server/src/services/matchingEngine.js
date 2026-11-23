export function scoreMatch(learnerProfile, mentorProfile, mentorPersonProfile, skillCatalogMap = {}) {
  // Extract learner skill names
  const learnerSkills = new Set(
    (learnerProfile?.skills || [])
      .map((ps) => {
        const skill = skillCatalogMap[ps.skillId];
        return skill ? skill.name.toLowerCase() : "";
      })
      .filter(Boolean)
  );

  // Extract mentor skill names
  const mentorSkills = new Set(
    (mentorPersonProfile?.skills || [])
      .map((ps) => {
        const skill = skillCatalogMap[ps.skillId];
        return skill ? skill.name.toLowerCase() : "";
      })
      .filter(Boolean)
  );

  const overlap = [];
  for (const s of learnerSkills) {
    if (mentorSkills.has(s)) {
      overlap.push(s);
    }
  }

  const skillScore = learnerSkills.size === 0 ? 0.5 : overlap.length / learnerSkills.size;
  const goalScore = calculateGoalMatch(
    learnerProfile?.learningGoals,
    mentorSkills,
    mentorPersonProfile?.bio,
    mentorProfile?.headline
  );
  const expScore = calculateExperienceMatch(
    learnerProfile?.experienceYears || 0,
    mentorPersonProfile?.experienceYears || 0
  );
  const availScore = calculateAvailabilityMatch(
    learnerProfile?.availability,
    mentorPersonProfile?.availability
  );
  const ratingScore = mentorProfile?.rating ? mentorProfile.rating / 5.0 : 0;

  const weighted =
    skillScore * 0.5 +
    goalScore * 0.2 +
    expScore * 0.15 +
    availScore * 0.1 +
    ratingScore * 0.05;

  const matchScore = Math.round(Math.min(100, weighted * 100));

  const reasons = [];
  if (overlap.length > 0) {
    // Capitalize for display
    const prettyOverlap = overlap.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    reasons.push(`Strong ${prettyOverlap.join(", ")} skill overlap`);
  } else {
    reasons.push("Limited direct skill overlap — complementary mentoring possible");
  }

  if (goalScore >= 0.5) {
    reasons.push("Matches learning goal");
  }
  if (availScore >= 0.7) {
    reasons.push("Availability compatible");
  }
  if (mentorProfile?.rating >= 4.0) {
    reasons.push(`High mentor rating (${Number(mentorProfile.rating).toFixed(1)})`);
  }
  if ((mentorPersonProfile?.experienceYears || 0) >= (learnerProfile?.experienceYears || 0) + 2) {
    reasons.push("Senior experience gap suitable for mentoring");
  }

  return {
    mentorId: mentorProfile.id,
    matchScore,
    reasons,
  };
}

function calculateGoalMatch(goals, mentorSkills, bio, headline) {
  if (!goals || !goals.trim()) {
    return 0.4;
  }
  const hay = `${goals} ${bio || ""} ${headline || ""}`.toLowerCase();
  let hits = 0;
  for (const s of mentorSkills) {
    if (hay.includes(s)) hits++;
  }
  if (hits === 0) {
    const g = goals.toLowerCase();
    for (const s of mentorSkills) {
      if (g.includes(s)) hits++;
    }
  }
  if (mentorSkills.size === 0) return 0.3;
  return Math.min(1.0, hits / Math.max(1, Math.min(3, mentorSkills.size)));
}

function calculateExperienceMatch(learnerYears, mentorYears) {
  const gap = mentorYears - learnerYears;
  if (gap >= 2 && gap <= 12) return 1.0;
  if (gap > 0) return 0.7;
  return 0.35;
}

function calculateAvailabilityMatch(a, b) {
  if (a === b || a === "FLEXIBLE" || b === "FLEXIBLE") return 1.0;
  if (
    (a === "WEEKNIGHTS" && b === "WEEKDAYS") ||
    (a === "WEEKDAYS" && b === "WEEKNIGHTS")
  ) {
    return 0.6;
  }
  return 0.35;
}
