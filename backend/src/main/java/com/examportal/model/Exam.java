package com.examportal.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exams")
public class Exam {

    @Id
    private String id;

    private String title;

    private String description;

    private int durationMinutes;

    private int totalMarks;

    private int passingMarks;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private ExamStatus status = ExamStatus.DRAFT;

    private List<String> questionIds;

    private int maxAttempts = 1;

    private boolean shuffleQuestions = true;

    private boolean shuffleOptions = true;

    private String subject;

    private String createdBy; // Admin user ID

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ExamStatus {
        DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED
    }
}
