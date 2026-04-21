package com.examportal.controller;

import com.examportal.dto.ExamDto;
import com.examportal.dto.QuestionDto;
import com.examportal.dto.SubmissionDto;
import com.examportal.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(studentService.getStudentDashboard(studentId));
    }

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDto.ExamResponse>> getAvailableExams(HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(studentService.getAvailableExams(studentId));
    }

    @GetMapping("/exams/{examId}")
    public ResponseEntity<ExamDto.ExamResponse> getExamDetails(@PathVariable String examId) {
        return ResponseEntity.ok(studentService.getExamDetails(examId));
    }

    @PostMapping("/exams/{examId}/start")
    public ResponseEntity<SubmissionDto.StartExamResponse> startExam(
            @PathVariable String examId,
            HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(studentService.startExam(examId, studentId));
    }

    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<List<QuestionDto.QuestionResponse>> getExamQuestions(
            @PathVariable String examId,
            HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(studentService.getExamQuestions(examId, studentId));
    }

    @PutMapping("/submissions/{submissionId}/autosave")
    public ResponseEntity<Void> autoSave(
            @PathVariable String submissionId,
            @RequestBody SubmissionDto.AutoSaveRequest body,
            HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        studentService.autoSave(submissionId, body, studentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submissions/{submissionId}/submit")
    public ResponseEntity<SubmissionDto.SubmissionResponse> submit(
            @PathVariable String submissionId,
            @Valid @RequestBody SubmissionDto.SubmitRequest body,
            HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(studentService.submitExam(submissionId, body, studentId));
    }

    @GetMapping("/results")
    public ResponseEntity<List<SubmissionDto.SubmissionResponse>> getResults(HttpServletRequest request) {
        String studentId = (String) request.getAttribute("userId");
        return ResponseEntity.ok(studentService.getMyResults(studentId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(
            @RequestParam(required = false) String examId) {
        return ResponseEntity.ok(studentService.getLeaderboard(examId));
    }
}
