package com.examportal.dto;

import com.examportal.model.Exam;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class ExamDto {

    @Data
    public static class CreateExamRequest {
        @NotBlank
        private String title;

        private String description;

        @Min(1)
        private int durationMinutes;

        private int totalMarks;

        private int passingMarks;

        private LocalDateTime startTime;

        private LocalDateTime endTime;

        private String subject;

        private boolean shuffleQuestions = true;

        private boolean shuffleOptions = true;

        private List<String> questionIds;
    }

    @Data
    public static class ExamResponse {
        private String id;
        private String title;
        private String description;
        private int durationMinutes;
        private int totalMarks;
        private int passingMarks;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Exam.ExamStatus status;
        private String subject;
        private int questionCount;
        private LocalDateTime createdAt;
    }

    @Data
    public static class DashboardStats {
        private long totalExams;
        private long activeExams;
        private long totalStudents;
        private long totalSubmissions;
        private double averageScore;
        private long pendingEvaluations;
    }
}
