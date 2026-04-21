package com.examportal.service;

import com.examportal.dto.ExamDto;
import com.examportal.dto.QuestionDto;
import com.examportal.dto.SubmissionDto;
import com.examportal.model.Exam;
import com.examportal.model.Question;
import com.examportal.model.Submission;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.SubmissionRepository;
import com.examportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    // ── Available Exams ────────────────────────────────────────────────────────

    public List<ExamDto.ExamResponse> getAvailableExams(String studentId) {
        List<Exam.ExamStatus> active = List.of(Exam.ExamStatus.SCHEDULED, Exam.ExamStatus.ACTIVE);
        return examRepository.findByStatusIn(active).stream()
                .map(this::toExamResponse)
                .collect(Collectors.toList());
    }

    public ExamDto.ExamResponse getExamDetails(String examId) {
        return toExamResponse(examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found")));
    }

    // ── Start Exam ─────────────────────────────────────────────────────────────

    public SubmissionDto.StartExamResponse startExam(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Check if already started / in progress
        Optional<Submission> existing = submissionRepository
                .findByStudentIdAndExamIdAndStatus(studentId, examId, Submission.SubmissionStatus.IN_PROGRESS);

        if (existing.isPresent()) {
            // Resume
            Submission sub = existing.get();
            SubmissionDto.StartExamResponse res = new SubmissionDto.StartExamResponse();
            res.setSubmissionId(sub.getId());
            res.setExamId(examId);
            res.setExamTitle(exam.getTitle());
            res.setDurationMinutes(exam.getDurationMinutes());
            res.setStartedAt(sub.getStartedAt());
            res.setSavedAnswers(sub.getAnswers());
            res.setMarkedForReview(sub.getMarkedForReview());
            return res;
        }

        // Check max attempts
        long attempts = submissionRepository.countByStudentIdAndExamId(studentId, examId);
        if (attempts >= exam.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached");
        }

        Submission sub = new Submission();
        sub.setStudentId(studentId);
        sub.setExamId(examId);
        sub.setStartedAt(LocalDateTime.now());
        sub.setAnswers(new HashMap<>());
        sub.setMarkedForReview(new ArrayList<>());
        Submission saved = submissionRepository.save(sub);

        SubmissionDto.StartExamResponse res = new SubmissionDto.StartExamResponse();
        res.setSubmissionId(saved.getId());
        res.setExamId(examId);
        res.setExamTitle(exam.getTitle());
        res.setDurationMinutes(exam.getDurationMinutes());
        res.setStartedAt(saved.getStartedAt());
        res.setSavedAnswers(new HashMap<>());
        res.setMarkedForReview(new ArrayList<>());
        return res;
    }

    // ── Get Questions for Exam (without correct answers) ──────────────────────

    public List<QuestionDto.QuestionResponse> getExamQuestions(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<Question> questions = questionRepository.findAllById(
                exam.getQuestionIds() != null ? exam.getQuestionIds() : new ArrayList<>());

        if (exam.isShuffleQuestions()) {
            Collections.shuffle(questions);
        }

        return questions.stream().map(q -> {
            QuestionDto.QuestionResponse r = new QuestionDto.QuestionResponse();
            r.setId(q.getId());
            r.setText(q.getText());
            r.setType(q.getType());
            r.setMarks(q.getMarks());
            r.setDifficulty(q.getDifficulty());
            r.setSubject(q.getSubject());
            r.setTopic(q.getTopic());
            List<Question.Option> opts = q.getOptions() != null ? new ArrayList<>(q.getOptions()) : new ArrayList<>();
            if (exam.isShuffleOptions() && !opts.isEmpty()) Collections.shuffle(opts);
            r.setOptions(opts);
            return r;
        }).collect(Collectors.toList());
    }

    // ── Auto-Save ──────────────────────────────────────────────────────────────

    public void autoSave(String submissionId, SubmissionDto.AutoSaveRequest req, String studentId) {
        Submission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!sub.getStudentId().equals(studentId)) throw new RuntimeException("Unauthorized");
        if (sub.getStatus() != Submission.SubmissionStatus.IN_PROGRESS) throw new RuntimeException("Exam already submitted");

        sub.setAnswers(req.getAnswers());
        sub.setMarkedForReview(req.getMarkedForReview());
        sub.setTabSwitchCount(req.getTabSwitchCount());
        submissionRepository.save(sub);
    }

    // ── Submit ─────────────────────────────────────────────────────────────────

    public SubmissionDto.SubmissionResponse submitExam(String submissionId,
                                                        SubmissionDto.SubmitRequest req,
                                                        String studentId) {
        Submission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!sub.getStudentId().equals(studentId)) throw new RuntimeException("Unauthorized");
        if (sub.getStatus() != Submission.SubmissionStatus.IN_PROGRESS) throw new RuntimeException("Already submitted");

        sub.setAnswers(req.getAnswers());
        sub.setMarkedForReview(req.getMarkedForReview());
        sub.setTabSwitchCount(req.getTabSwitchCount());
        sub.setSubmittedAt(LocalDateTime.now());
        sub.setStatus(Submission.SubmissionStatus.SUBMITTED);

        // Auto-grade MCQ / MULTI_SELECT
        Exam exam = examRepository.findById(sub.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        List<Question> questions = questionRepository.findAllById(
                exam.getQuestionIds() != null ? exam.getQuestionIds() : List.of());

        int score = 0;
        List<Submission.QuestionResult> results = new ArrayList<>();
        boolean hasDescriptive = false;

        for (Question q : questions) {
            String given = req.getAnswers() != null ? req.getAnswers().get(q.getId()) : null;
            boolean correct = false;
            int marksAwarded = 0;

            if (q.getType() == Question.QuestionType.DESCRIPTIVE) {
                hasDescriptive = true;
            } else if (q.getType() == Question.QuestionType.MCQ) {
                correct = q.getCorrectAnswer() != null && q.getCorrectAnswer().equals(given);
                marksAwarded = correct ? q.getMarks() : 0;
            } else if (q.getType() == Question.QuestionType.MULTI_SELECT) {
                if (given != null && q.getCorrectAnswer() != null) {
                    Set<String> givenSet = new HashSet<>(Arrays.asList(given.split(",")));
                    Set<String> correctSet = new HashSet<>(Arrays.asList(q.getCorrectAnswer().split(",")));
                    correct = givenSet.equals(correctSet);
                    marksAwarded = correct ? q.getMarks() : 0;
                }
            }

            score += marksAwarded;
            results.add(new Submission.QuestionResult(q.getId(), given, q.getCorrectAnswer(), correct, marksAwarded));
        }

        sub.setScore(score);
        sub.setTotalMarks(exam.getTotalMarks());
        sub.setQuestionResults(results);

        if (!hasDescriptive) {
            sub.setStatus(Submission.SubmissionStatus.EVALUATED);
            sub.setResultPublished(true);
        }

        Submission saved = submissionRepository.save(sub);
        return toSubmissionResponse(saved, exam.getTitle());
    }

    // ── Results ────────────────────────────────────────────────────────────────

    public List<SubmissionDto.SubmissionResponse> getMyResults(String studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .filter(s -> s.isResultPublished())
                .map(s -> {
                    Exam exam = examRepository.findById(s.getExamId()).orElse(null);
                    return toSubmissionResponse(s, exam != null ? exam.getTitle() : "Unknown Exam");
                }).collect(Collectors.toList());
    }

    public Map<String, Object> getStudentDashboard(String studentId) {
        List<Submission> all = submissionRepository.findByStudentId(studentId);
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalAttempts", all.size());
        dashboard.put("completed", all.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.EVALUATED).count());
        dashboard.put("inProgress", all.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.IN_PROGRESS).count());
        OptionalDouble avg = all.stream()
                .filter(s -> s.getScore() != null && s.getTotalMarks() != null && s.getTotalMarks() > 0)
                .mapToDouble(s -> s.getScore() * 100.0 / s.getTotalMarks())
                .average();
        dashboard.put("averageScore", avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : 0.0);
        return dashboard;
    }

    // ── Leaderboard ────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getLeaderboard(String examId) {
        List<Submission> subs = examId != null
                ? submissionRepository.findByExamId(examId)
                : submissionRepository.findAll();

        return subs.stream()
                .filter(s -> s.getStatus() == Submission.SubmissionStatus.EVALUATED && s.isResultPublished())
                .sorted(Comparator.comparingDouble((Submission s) ->
                        s.getTotalMarks() > 0 ? -(s.getScore() * 100.0 / s.getTotalMarks()) : 0))
                .limit(50)
                .map(s -> {
                    Map<String, Object> entry = new HashMap<>();
                    userRepository.findById(s.getStudentId()).ifPresent(u -> {
                        entry.put("studentName", u.getName());
                        entry.put("studentEmail", u.getEmail());
                    });
                    entry.put("score", s.getScore());
                    entry.put("totalMarks", s.getTotalMarks());
                    entry.put("percentage", s.getTotalMarks() > 0 ? s.getScore() * 100.0 / s.getTotalMarks() : 0);
                    entry.put("examId", s.getExamId());
                    return entry;
                }).collect(Collectors.toList());
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

    private SubmissionDto.SubmissionResponse toSubmissionResponse(Submission sub, String examTitle) {
        SubmissionDto.SubmissionResponse res = new SubmissionDto.SubmissionResponse();
        res.setId(sub.getId());
        res.setExamId(sub.getExamId());
        res.setExamTitle(examTitle);
        res.setScore(sub.getScore());
        res.setTotalMarks(sub.getTotalMarks());
        if (sub.getTotalMarks() != null && sub.getTotalMarks() > 0 && sub.getScore() != null) {
            res.setPercentage(Math.round(sub.getScore() * 1000.0 / sub.getTotalMarks()) / 10.0);
        }
        res.setStatus(sub.getStatus());
        res.setStartedAt(sub.getStartedAt());
        res.setSubmittedAt(sub.getSubmittedAt());
        res.setTabSwitchCount(sub.getTabSwitchCount());
        res.setAutoSubmitted(sub.isAutoSubmitted());
        res.setResultPublished(sub.isResultPublished());
        res.setQuestionResults(sub.getQuestionResults());
        return res;
    }
}
