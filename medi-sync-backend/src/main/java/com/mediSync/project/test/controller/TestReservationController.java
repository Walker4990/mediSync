package com.mediSync.project.test.controller;

import com.mediSync.project.test.service.TestReservationService;
import com.mediSync.project.test.vo.TestReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/test/reservation")
public class TestReservationController {

    private final TestReservationService testReservationService;

    // 전체 조회
    @GetMapping
    public List<TestReservation> selectTestReservation() {
        return testReservationService.selectTestReservation();
    }

    @GetMapping("/page")
    public Map<String, Object> selectPaged(     @RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "10") int size
    ){
        return testReservationService.selectPaged(page, size);
    }

    @GetMapping("/group/{group}/page")
    public Map<String, Object> selectPagedByGroup(@PathVariable("group") String group,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int size){
        return testReservationService.selectPagedByGroup(group, page, size);
    }

    @GetMapping("/group/{group}/search")
    public List<TestReservation> searchByGroupAndKeyword( @PathVariable("group") String group,
                                                          @RequestParam(required = false) String keyword,
                                                          @RequestParam(required = false) String startDate,
                                                          @RequestParam(required = false) String endDate){
        return testReservationService.searchByGroupAndKeyword(group, keyword, startDate, endDate);
    }

    // 단건 조회 (환자 기준)
    @GetMapping("/{patientId}")
    public TestReservation findTestReservationByPatientId(@PathVariable Long patientId) {
        return testReservationService.findTestReservationByPatientId(patientId);
    }

    // 등록
    @PostMapping
    public ResponseEntity<?> insertTestReservation(@RequestBody TestReservation testReservation) {
        testReservationService.insertTestReservation(testReservation);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // 수정 (예약 ID 기준)
    @PutMapping("/{reservationId}")
    public ResponseEntity<?> updateTestReservation(
            @PathVariable Long reservationId,
            @RequestBody TestReservation testReservation) {

        testReservation.setReservationId(reservationId);
        testReservationService.updateTestReservation(testReservation);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // 삭제 (예약 ID 기준)
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<?> deleteTestReservation(@PathVariable Long reservationId) {
        testReservationService.deleteTestReservation(reservationId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
