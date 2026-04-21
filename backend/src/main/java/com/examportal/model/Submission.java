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
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "submissions")
public class Submission {

    @Id
    private String id;

    private String studentId;

    private String examId;

    private Map<String, String> answers; // questionId -> answer

    private List<String> markedForReview;

    private Integer score;

    private Integer totalMarks;

    private SubmissionStatus status = SubmissionStatus.IN_PROGRESS;

    private int tabSwitchCount = 0;

    private boolean autoSubmitted = false;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private List<QuestionResult> questionResults;

    private String descriptiveEvaluation;

    private boolean resultPublished = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String questionId;
        private String givenAnswer;
        private String correctAnswer;
        private boolean isCorrect;
        private int marksAwarded;
    }

    public enum SubmissionStatus {
        IN_PROGRESS, SUBMITTED, EVALUATED
    }
}
