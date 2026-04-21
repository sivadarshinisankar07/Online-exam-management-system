package com.examportal.config;

import com.examportal.model.User;
import com.examportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedStudent();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@exam.com")) {
            log.info("[Seeder] Admin already exists — skipping.");
            return;
        }

        User admin = new User();
        admin.setName("Demo Admin");
        admin.setEmail("admin@exam.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);
        admin.setEmailVerified(true);

        userRepository.save(admin);
        log.info("[Seeder] ✅ Demo admin created → admin@exam.com / admin123");
    }

    private void seedStudent() {
        if (userRepository.existsByEmail("student@exam.com")) {
            log.info("[Seeder] Demo student already exists — skipping.");
            return;
        }

        User student = new User();
        student.setName("Demo Student");
        student.setEmail("student@exam.com");
        student.setPassword(passwordEncoder.encode("student123"));
        student.setRole(User.Role.STUDENT);
        student.setActive(true);
        student.setEmailVerified(true);

        userRepository.save(student);
        log.info("[Seeder] ✅ Demo student created → student@exam.com / student123");
    }
}
