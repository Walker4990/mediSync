package com.mediSync.project.patient.mapper;

import com.mediSync.project.patient.vo.PatientNote;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PatientNoteMapper {
    List<PatientNote> findByPatientId(Long patientId);
    int insertNote(PatientNote note);
    int updateNote(PatientNote note);
    int deleteNote(Long noteId);
}
