package com.mediSync.project.patient.service;

import com.mediSync.project.patient.dto.QuestionnaireDTO;
import com.mediSync.project.patient.mapper.QuestionnaireMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionnaireService {

    @Autowired
    private QuestionnaireMapper questionnaireMapper;

    @Transactional
    public void submitQuestionnaire(QuestionnaireDTO dto) {
        if (questionnaireMapper.getQuestionnaireByReservationId(dto.getReservationId()) != null) {
            throw new RuntimeException("이미 문진표가 작성된 예약입니다.");
        }
        questionnaireMapper.insertQuestionnaire(dto);
    }

    public QuestionnaireDTO getQuestionnaireByReservationId(Long reservationId) {
        return questionnaireMapper.getQuestionnaireByReservationId(reservationId);
    }
}