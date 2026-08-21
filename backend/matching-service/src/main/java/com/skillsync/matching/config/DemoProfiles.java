package com.skillsync.matching.config;

/**
 * Demo personas used by {@link MatchingSeeder}. Auth seeds admin=1, Maya=2, Uma=3.
 * Extra catalog mentors use high reserved ids so new registrations (4, 5, …) stay empty.
 */
public final class DemoProfiles {
    public static final String MAYA = "Maya Mentor";
    public static final String UMA = "Uma User";
    public static final String LEO = "Leo Backend";
    public static final String PRIYA = "Priya Cloud";

    public static final long MAYA_USER_ID = 2L;
    public static final long UMA_USER_ID = 3L;
    public static final long LEO_USER_ID = 9004L;
    public static final long PRIYA_USER_ID = 9005L;

    private DemoProfiles() {}

    public static Long reservedUserId(String fullName) {
        if (fullName == null) {
            return null;
        }
        return switch (fullName) {
            case MAYA -> MAYA_USER_ID;
            case UMA -> UMA_USER_ID;
            case LEO -> LEO_USER_ID;
            case PRIYA -> PRIYA_USER_ID;
            default -> null;
        };
    }
}
