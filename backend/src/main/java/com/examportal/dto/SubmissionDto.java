package com.examportal.dto;

import com.examportal.model.Submission;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class SubmissionDto {

    @Data
    public static class AutoSaveRequest {
        private Map<String, String> answers;
        private List<String> markedForReview;
        private int tabSwitchCount;
    }

    @Data
    public static class SubmitRequest {
        private Map<String, String> answers;
        private List<String> markedForReview;
        private int tabSwitchCount;
    }

    @Data
    public static class SubmissionResponse {
        private String id;
        private String examId;
        private String examTitle;
        private Integer score;
        private Integer totalMarks;
        private Double percentage;
        private Submission.SubmissionStatus status;
        private LocalDateTime startedAt;
        private LocalDateTime submittedAt;
        private int tabSwitchCount;
        private boolean autoSubmitted;
        private boolean resultPublished;
        private List<Submission.QuestionResult> questionResults;
    }

    @Data
    public static class StartExamResponse {
        private String submissionId;
        private String examId;
        private String examTitle;
        private int durationMinutes;
        private LocalDateTime startedAt;
        private Map<String, String> savedAnswers;
        private List<String> markedForReview;
    }

    @Data
    public static class LiveSubmissionInfo {
        private String submissionId;
        private String studentId;
        private String studentName;
        private String studentEmail;
        private int answeredCount;
        private int tabSwitchCount;
        private Submission.SubmissionStatus status;
        private LocalDateTime startedAt;
    }
}
