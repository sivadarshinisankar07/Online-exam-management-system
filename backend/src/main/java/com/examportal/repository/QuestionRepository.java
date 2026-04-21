package com.examportal.repository;

import com.examportal.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByIsInQuestionBank(boolean inBank);
    List<Question> findBySubject(String subject);
    List<Question> findByDifficulty(Question.Difficulty difficulty);
    List<Question> findBySubjectAndDifficulty(String subject, Question.Difficulty difficulty);
    List<Question> findByIdIn(List<String> ids);
    long countByIsInQuestionBank(boolean inBank);
}
