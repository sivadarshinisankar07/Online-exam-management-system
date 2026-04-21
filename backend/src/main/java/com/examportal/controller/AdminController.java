package com.examportal.controller;

import com.examportal.dto.ExamDto;
import com.examportal.dto.QuestionDto;
import com.examportal.dto.SubmissionDto;
import com.examportal.model.Exam;
import com.examportal.model.Submission;
import com.examportal.model.User;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.SubmissionRepository;
import com.examportal.repository.UserRepository;
import com.examportal.service.AdminService;
import com.examportal.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final StudentService studentService;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;

    // ── Dashboard ──────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ExamDto.DashboardStats> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ── Exams ──────────────────────────────────────────────────────────────────

    @PostMapping("/exams")
    public ResponseEntity<ExamDto.ExamResponse> createExam(
            @Valid @RequestBody ExamDto.CreateExamRequest request,
            HttpServletRequest httpRequest) {
        String adminId = (String) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(adminService.createExam(request, adminId));
    }

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDto.ExamResponse>> getAllExams() {
        return ResponseEntity.ok(adminService.getAllExams());
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<ExamDto.ExamResponse> getExam(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getExamById(id));
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<ExamDto.ExamResponse> updateExam(
            @PathVariable String id,
            @Valid @RequestBody ExamDto.CreateExamRequest request) {
        return ResponseEntity.ok(adminService.updateExam(id, request));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable String id) {
        adminService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/exams/{id}/status")
    public ResponseEntity<ExamDto.ExamResponse> updateExamStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        Exam.ExamStatus status = Exam.ExamStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(adminService.updateExamStatus(id, status));
    }

    // ── Questions ──────────────────────────────────────────────────────────────

    @PostMapping("/exams/{examId}/questions")
    public ResponseEntity<QuestionDto.QuestionWithAnswer> addQuestion(
            @PathVariable String examId,
            @Valid @RequestBody QuestionDto.CreateQuestionRequest request,
            HttpServletRequest httpRequest) {
        String adminId = (String) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(adminService.createQuestion(examId, request, adminId));
    }

    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<List<QuestionDto.QuestionWithAnswer>> getExamQuestions(@PathVariable String examId) {
        return ResponseEntity.ok(adminService.getExamQuestions(examId));
    }

    @PostMapping("/questions")
    public ResponseEntity<QuestionDto.QuestionWithAnswer> addToBank(
            @Valid @RequestBody QuestionDto.CreateQuestionRequest request,
            HttpServletRequest httpRequest) {
        String adminId = (String) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(adminService.createQuestion(null, request, adminId));
    }

    @GetMapping("/question-bank")
    public ResponseEntity<List<QuestionDto.QuestionWithAnswer>> getQuestionBank() {
        return ResponseEntity.ok(adminService.getQuestionBank());
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String questionId) {
        adminService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    // ── Students ───────────────────────────────────────────────────────────────

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        List<User> students = adminService.getAllStudents();
        // Remove password from response
        students.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(students);
    }

    @PatchMapping("/students/{studentId}/toggle-status")
    public ResponseEntity<Void> toggleStudentStatus(@PathVariable String studentId) {
        adminService.toggleStudentStatus(studentId);
        return ResponseEntity.ok().build();
    }

    // ── Results ────────────────────────────────────────────────────────────────

    @Data
    static class EnrichedResult {
        String id;
        String examId;
        String examTitle;
        String studentId;
        String studentName;
        String studentEmail;
        Integer score;
        Integer totalMarks;
        Double percentage;
        Submission.SubmissionStatus status;
        boolean resultPublished;
        int tabSwitchCount;
        boolean autoSubmitted;
        LocalDateTime submittedAt;
    }

    private EnrichedResult enrich(Submission s) {
        EnrichedResult r = new EnrichedResult();
        r.setId(s.getId());
        r.setExamId(s.getExamId());
        r.setStudentId(s.getStudentId());
        r.setScore(s.getScore());
        r.setTotalMarks(s.getTotalMarks());
        r.setStatus(s.getStatus());
        r.setResultPublished(s.isResultPublished());
        r.setTabSwitchCount(s.getTabSwitchCount());
        r.setAutoSubmitted(s.isAutoSubmitted());
        r.setSubmittedAt(s.getSubmittedAt());
        if (s.getTotalMarks() != null && s.getTotalMarks() > 0 && s.getScore() != null) {
            r.setPercentage(Math.round(s.getScore() * 1000.0 / s.getTotalMarks()) / 10.0);
        }
        examRepository.findById(s.getExamId()).ifPresent(e -> r.setExamTitle(e.getTitle()));
        userRepository.findById(s.getStudentId()).ifPresent(u -> {
            r.setStudentName(u.getName());
            r.setStudentEmail(u.getEmail());
        });
        return r;
    }

    @GetMapping("/results")
    public ResponseEntity<List<EnrichedResult>> getAllResults() {
        List<EnrichedResult> list = adminService.getAllResults().stream()
                .map(this::enrich).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/exams/{examId}/results")
    public ResponseEntity<List<EnrichedResult>> getExamResults(@PathVariable String examId) {
        List<EnrichedResult> list = adminService.getResultsByExam(examId).stream()
                .map(this::enrich).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/submissions/{submissionId}/publish")
    public ResponseEntity<Submission> publishResult(
            @PathVariable String submissionId,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(adminService.publishResult(submissionId, body.getOrDefault("publish", true)));
    }

    // ── Live Monitor ───────────────────────────────────────────────────────────

    @GetMapping("/live-monitor")
    public ResponseEntity<List<SubmissionDto.LiveSubmissionInfo>> getLiveMonitor(
            @RequestParam(required = false) String examId) {
        List<Submission> live = examId != null
                ? submissionRepository.findByExamIdAndStatus(examId, Submission.SubmissionStatus.IN_PROGRESS)
                : submissionRepository.findByStatus(Submission.SubmissionStatus.IN_PROGRESS);

        List<SubmissionDto.LiveSubmissionInfo> result = live.stream().map(s -> {
            SubmissionDto.LiveSubmissionInfo info = new SubmissionDto.LiveSubmissionInfo();
            info.setSubmissionId(s.getId());
            info.setStudentId(s.getStudentId());
            userRepository.findById(s.getStudentId()).ifPresent(u -> {
                info.setStudentName(u.getName());
                info.setStudentEmail(u.getEmail());
            });
            info.setAnsweredCount(s.getAnswers() != null ? s.getAnswers().size() : 0);
            info.setTabSwitchCount(s.getTabSwitchCount());
            info.setStatus(s.getStatus());
            info.setStartedAt(s.getStartedAt());
            return info;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Leaderboard ────────────────────────────────────────────────────────────

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(
            @RequestParam(required = false) String examId) {
        return ResponseEntity.ok(studentService.getLeaderboard(examId));
    }
}
