package com.examportal.service;

import com.examportal.dto.AuthDto;
import com.examportal.model.User;
import com.examportal.repository.UserRepository;
import com.examportal.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.STUDENT);

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        return new AuthDto.AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDto.AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
