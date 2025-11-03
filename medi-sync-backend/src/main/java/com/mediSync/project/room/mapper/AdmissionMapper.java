package com.mediSync.project.room.mapper;

import com.mediSync.project.room.vo.Admission;
import com.mediSync.project.room.vo.Room;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface AdmissionMapper {
    int insertAdmission(@Param("patientId") Long patientId,
                        @Param("operationId") Long operationId,
                        @Param("roomId") Long roomId);

    boolean existsByOperationId(Integer operationId);

    List<Admission> getAdmissionList();
    int updateDischarge(Long admissionId);
    Long findRoomIdByAdmissionId(Long admissionId);

    void decreaseRoomCount(Long roomId);

    void updateRoomStatusIfAvailable(Long roomId);
    List<Admission> getAdmissionsByRoom(Long roomId);
    int updateExpectedDischargeDate(Map<String, Object> params);

    // 퇴원 D-1인 환자 조회
    List<Admission> getDischargeAlerts();
    List<Admission> getDischargeAlertsDday();

    // 병실 이동
    List<Room> findAvailableRoomsForTransfer(Map<String, Object> params);
    Room findRoomById(Long roomId);
    int updateRoom(@Param("admissionId") Long admissionId,
                   @Param("newRoomId") Long newRoomId);
    Admission findAdmissionById(Long admissionId);
}
