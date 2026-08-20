package com.skillsync.matching.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "profile_skills")
public class ProfileSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;
    @ManyToOne(optional = false)
    @JoinColumn(name = "skill_id")
    private Skill skill;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillLevel level;
    @Column(nullable = false)
    private int progress;

    public Long getId() { return id; }
    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }
    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
    public SkillLevel getLevel() { return level; }
    public void setLevel(SkillLevel level) { this.level = level; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
}
