package com.examportal.dto;

import com.examportal.model.Question;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

public class QuestionDto {

    @Data
    public static class CreateQuestionRequest {
        @NotBlank
        private String text;

        private Question.QuestionType type;

        private List<Question.Option> options;

        private String correctAnswer;

        private List<String> correctAnswers;

        private int marks = 1;

        private Question.Difficulty difficulty = Question.Difficulty.MEDIUM;

        private String subject;

        private String topic;

        private String explanation;

        private boolean addToQuestionBank = false;
    }

    @Data
    public static class QuestionResponse {
        private String id;
        private String text;
        private Question.QuestionType type;
        private List<Question.Option> options;
        private int marks;
        private Question.Difficulty difficulty;
        private String subject;
        private String topic;
        private boolean isInQuestionBank;
        // correctAnswer omitted for student-facing scenarios
    }

    @Data
    public static class QuestionWithAnswer {
        private String id;
        private String text;
        private Question.QuestionType type;
        private List<Question.Option> options;
        private int marks;
        private Question.Difficulty difficulty;
        private String subject;
        private String topic;
        private String explanation;
        private String correctAnswer;
        private List<String> correctAnswers;
    }
}
