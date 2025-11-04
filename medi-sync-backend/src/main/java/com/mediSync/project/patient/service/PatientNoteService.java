package com.mediSync.project.patient.service;

import com.mediSync.project.patient.mapper.PatientNoteMapper;
import com.mediSync.project.patient.vo.PatientNote;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientNoteService {
    private final PatientNoteMapper patientNoteMapper;

    public List<PatientNote> getNotes(Long patientId) {
        return patientNoteMapper.findByPatientId(patientId);
    }

    public boolean addNote(PatientNote note) {
        return patientNoteMapper.insertNote(note) > 0;
    }

    public boolean editNote(PatientNote note) {
        return patientNoteMapper.updateNote(note) > 0;
    }

    public boolean deleteNote(Long noteId) {
        return patientNoteMapper.deleteNote(noteId) > 0;
    }
}
