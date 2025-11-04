package com.mediSync.project.patient.controller;

import com.mediSync.project.patient.service.PatientNoteService;
import com.mediSync.project.patient.vo.PatientNote;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/patient/notes")
public class PatientNoteController {
    private final PatientNoteService noteService;

    @GetMapping("/{patientId}")
    public List<PatientNote> getNotes(@PathVariable Long patientId) {
        return noteService.getNotes(patientId);
    }

    @PostMapping
    public ResponseEntity<?> addNote(@RequestBody PatientNote note) {
        return noteService.addNote(note)
                ? ResponseEntity.ok("등록 완료")
                : ResponseEntity.badRequest().body("등록 실패");
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<?> updateNote(@PathVariable Long noteId, @RequestBody PatientNote note) {
        note.setNoteId(noteId);
        return noteService.editNote(note)
                ? ResponseEntity.ok("수정 완료")
                : ResponseEntity.badRequest().body("수정 실패");
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long noteId) {
        return noteService.deleteNote(noteId)
                ? ResponseEntity.ok("삭제 완료")
                : ResponseEntity.badRequest().body("삭제 실패");
    }
}
