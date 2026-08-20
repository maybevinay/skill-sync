package com.skillsync.auth.config;

import com.skillsync.auth.domain.Role;
import com.skillsync.auth.domain.User;
import com.skillsync.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        seed("Amit Admin", "admin@skillsync.dev", "Admin@12345", Role.ADMIN, true);
        seed("Maya Mentor", "mentor@skillsync.dev", "Mentor@12345", Role.MENTOR, true);
        seed("Uma User", "user@skillsync.dev", "User@12345", Role.USER, true);
    }

    private void seed(String name, String email, String password, Role role, boolean verified) {
        if (users.existsByEmailIgnoreCase(email)) {
            return;
        }
        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        user.setEmailVerified(verified);
        users.save(user);
        log.info("Seeded {} ({})", email, role);
    }
}
