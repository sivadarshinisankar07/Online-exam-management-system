package com.examportal.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "questions")
public class Question {

    @Id
    private String id;

    private String text;

    private QuestionType type;

    private List<Option> options;

    private String correctAnswer; // For MCQ: option id; for MULTI: comma-separated ids

    private List<String> correctAnswers; // For MULTI-SELECT

    private int marks = 1;

    private Difficulty difficulty;

    private String subject;

    private String topic;

    private String explanation; // Shown after result

    private boolean isInQuestionBank = false;

    private String createdBy; // Admin user ID

    @CreatedDate
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Option {
        private String id;
        private String text;
    }

    public enum QuestionType {
        MCQ, MULTI_SELECT, DESCRIPTIVE
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}
