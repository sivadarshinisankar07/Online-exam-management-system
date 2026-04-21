package com.examportal.repository;

import com.examportal.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByStudentId(String studentId);
    List<Submission> findByExamId(String examId);
    Optional<Submission> findByStudentIdAndExamId(String studentId, String examId);
    Optional<Submission> findByStudentIdAndExamIdAndStatus(String studentId, String examId, Submission.SubmissionStatus status);
    List<Submission> findByExamIdAndStatus(String examId, Submission.SubmissionStatus status);
    List<Submission> findByStatus(Submission.SubmissionStatus status);
    boolean existsByStudentIdAndExamId(String studentId, String examId);
    long countByExamIdAndStatus(String examId, Submission.SubmissionStatus status);
    long countByStudentIdAndExamId(String studentId, String examId);
    long countByStatus(Submission.SubmissionStatus status);
}
