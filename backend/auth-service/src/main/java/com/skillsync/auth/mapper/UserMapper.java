package com.skillsync.auth.mapper;

import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}
