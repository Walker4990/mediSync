package com.mediSync.project.patient.mapper;

import com.mediSync.project.patient.dto.QuestionnaireDTO;

public interface QuestionnaireMapper {

    void insertQuestionnaire(QuestionnaireDTO questionnaireDTO);
    QuestionnaireDTO getQuestionnaireByReservationId(Long reservationId);
}
