package com.examportal.service;

import com.examportal.dto.ExamDto;
import com.examportal.dto.QuestionDto;
import com.examportal.model.Exam;
import com.examportal.model.Question;
import com.examportal.model.Submission;
import com.examportal.model.User;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.SubmissionRepository;
import com.examportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    // ── Exams ──────────────────────────────────────────────────────────────────

    public ExamDto.ExamResponse createExam(ExamDto.CreateExamRequest req, String adminId) {
        Exam exam = new Exam();
        exam.setTitle(req.getTitle());
        exam.setDescription(req.getDescription());
        exam.setDurationMinutes(req.getDurationMinutes());
        exam.setTotalMarks(req.getTotalMarks());
        exam.setPassingMarks(req.getPassingMarks());
        exam.setStartTime(req.getStartTime());
        exam.setEndTime(req.getEndTime());
        exam.setSubject(req.getSubject());
        exam.setShuffleQuestions(req.isShuffleQuestions());
        exam.setShuffleOptions(req.isShuffleOptions());
        exam.setCreatedBy(adminId);
        exam.setQuestionIds(req.getQuestionIds() != null ? req.getQuestionIds() : new ArrayList<>());

        // Auto-calculate totalMarks from questions if not provided
        if (req.getTotalMarks() <= 0 && req.getQuestionIds() != null && !req.getQuestionIds().isEmpty()) {
            int total = questionRepository.findAllById(req.getQuestionIds())
                    .stream().mapToInt(Question::getMarks).sum();
            exam.setTotalMarks(total);
        }

        return toExamResponse(examRepository.save(exam));
    }

    public List<ExamDto.ExamResponse> getAllExams() {
        return examRepository.findAll().stream().map(this::toExamResponse).collect(Collectors.toList());
    }

    public ExamDto.ExamResponse getExamById(String id) {
        return toExamResponse(examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found")));
    }

    public ExamDto.ExamResponse updateExam(String id, ExamDto.CreateExamRequest req) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        exam.setTitle(req.getTitle());
        exam.setDescription(req.getDescription());
        exam.setDurationMinutes(req.getDurationMinutes());
        exam.setTotalMarks(req.getTotalMarks());
        exam.setPassingMarks(req.getPassingMarks());
        exam.setStartTime(req.getStartTime());
        exam.setEndTime(req.getEndTime());
        exam.setSubject(req.getSubject());
        exam.setShuffleQuestions(req.isShuffleQuestions());
        exam.setShuffleOptions(req.isShuffleOptions());
        if (req.getQuestionIds() != null) exam.setQuestionIds(req.getQuestionIds());
        return toExamResponse(examRepository.save(exam));
    }

    public void deleteExam(String id) {
        examRepository.deleteById(id);
    }

    public ExamDto.ExamResponse updateExamStatus(String id, Exam.ExamStatus status) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        exam.setStatus(status);
        return toExamResponse(examRepository.save(exam));
    }

    // ── Questions ──────────────────────────────────────────────────────────────

    public QuestionDto.QuestionWithAnswer createQuestion(String examId, QuestionDto.CreateQuestionRequest req, String adminId) {
        Question q = new Question();
        q.setText(req.getText());
        q.setType(req.getType());
        q.setOptions(req.getOptions());
        q.setCorrectAnswer(req.getCorrectAnswer());
        q.setCorrectAnswers(req.getCorrectAnswers());
        q.setMarks(req.getMarks());
        q.setDifficulty(req.getDifficulty());
        q.setSubject(req.getSubject());
        q.setTopic(req.getTopic());
        q.setExplanation(req.getExplanation());
        q.setInQuestionBank(req.isAddToQuestionBank());
        q.setCreatedBy(adminId);

        Question saved = questionRepository.save(q);

        // Add to exam's question list
        if (examId != null) {
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            if (exam.getQuestionIds() == null) exam.setQuestionIds(new ArrayList<>());
            exam.getQuestionIds().add(saved.getId());
            // Recalculate total marks
            int total = exam.getQuestionIds().stream()
                    .mapToInt(qid -> questionRepository.findById(qid)
                            .map(Question::getMarks).orElse(0))
                    .sum();
            exam.setTotalMarks(total);
            examRepository.save(exam);
        }

        return toQuestionWithAnswer(saved);
    }

    public List<QuestionDto.QuestionWithAnswer> getExamQuestions(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        if (exam.getQuestionIds() == null || exam.getQuestionIds().isEmpty()) return new ArrayList<>();
        return questionRepository.findAllById(exam.getQuestionIds()).stream()
                .map(this::toQuestionWithAnswer).collect(Collectors.toList());
    }

    public List<QuestionDto.QuestionWithAnswer> getQuestionBank() {
        return questionRepository.findByIsInQuestionBank(true).stream()
                .map(this::toQuestionWithAnswer).collect(Collectors.toList());
    }

    public void deleteQuestion(String questionId) {
        questionRepository.deleteById(questionId);
    }

    // ── Students ───────────────────────────────────────────────────────────────

    public List<User> getAllStudents() {
        return userRepository.findByRole(User.Role.STUDENT);
    }

    public void toggleStudentStatus(String studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    // ── Dashboard ──────────────────────────────────────────────────────────────

    public ExamDto.DashboardStats getDashboardStats() {
        ExamDto.DashboardStats stats = new ExamDto.DashboardStats();
        stats.setTotalExams(examRepository.count());
        stats.setActiveExams(examRepository.countByStatus(Exam.ExamStatus.ACTIVE));
        stats.setTotalStudents(userRepository.countByRole(User.Role.STUDENT));
        stats.setTotalSubmissions(submissionRepository.count());

        List<Submission> evaluated = submissionRepository.findByStatus(Submission.SubmissionStatus.EVALUATED);
        stats.setAverageScore(evaluated.stream()
                .filter(s -> s.getTotalMarks() != null && s.getTotalMarks() > 0 && s.getScore() != null)
                .mapToDouble(s -> s.getScore() * 100.0 / s.getTotalMarks())
                .average().orElse(0.0));

        stats.setPendingEvaluations(submissionRepository.countByStatus(Submission.SubmissionStatus.SUBMITTED));
        return stats;
    }

    // ── Results ────────────────────────────────────────────────────────────────

    public List<Submission> getAllResults() {
        return submissionRepository.findAll();
    }

    public List<Submission> getResultsByExam(String examId) {
        return submissionRepository.findByExamId(examId);
    }

    public Submission publishResult(String submissionId, boolean publish) {
        Submission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        sub.setResultPublished(publish);
        return submissionRepository.save(sub);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private ExamDto.ExamResponse toExamResponse(Exam exam) {
        ExamDto.ExamResponse res = new ExamDto.ExamResponse();
        res.setId(exam.getId());
        res.setTitle(exam.getTitle());
        res.setDescription(exam.getDescription());
        res.setDurationMinutes(exam.getDurationMinutes());
        res.setTotalMarks(exam.getTotalMarks());
        res.setPassingMarks(exam.getPassingMarks());
        res.setStartTime(exam.getStartTime());
        res.setEndTime(exam.getEndTime());
        res.setStatus(exam.getStatus());
        res.setSubject(exam.getSubject());
        res.setQuestionCount(exam.getQuestionIds() != null ? exam.getQuestionIds().size() : 0);
        res.setCreatedAt(exam.getCreatedAt());
        return res;
    }

    private QuestionDto.QuestionWithAnswer toQuestionWithAnswer(Question q) {
        QuestionDto.QuestionWithAnswer res = new QuestionDto.QuestionWithAnswer();
        res.setId(q.getId());
        res.setText(q.getText());
        res.setType(q.getType());
        res.setOptions(q.getOptions());
        res.setMarks(q.getMarks());
        res.setDifficulty(q.getDifficulty());
        res.setSubject(q.getSubject());
        res.setTopic(q.getTopic());
        res.setExplanation(q.getExplanation());
        res.setCorrectAnswer(q.getCorrectAnswer());
        res.setCorrectAnswers(q.getCorrectAnswers());
        return res;
    }
}
