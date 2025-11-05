package com.mediSync.project.patient.service;

import com.mediSync.project.common.service.EmailService;
import com.mediSync.project.operation.mapper.OperationMapper;
import com.mediSync.project.patient.dto.ReservationDTO;
import com.mediSync.project.patient.mapper.ReservationMapper;
import com.mediSync.project.test.mapper.TestReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationMapper reservationMapper;
    private final TestReservationMapper testReservationMapper;
    private final OperationMapper operationMapper;

    private final EmailService emailService;
    //(cron = "0 */5 * * * ?") << 5분간격
    //(cron = "0 0 9 * * ?") << 아침 9시

    //예약 전날 오전 9시에 알림
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendReservationReminders(){
        
        //reservation 보내기
        String testEmail  = "silvermoon4989@gmail.com";
        LocalDateTime start = LocalDateTime.now().plusDays(1)
                                                    .withHour(0)
                                                    .withMinute(0)
                                                    .withSecond(0);
        LocalDateTime end = start.plusDays(1);

        List<ReservationDTO> reservationList = reservationMapper
                                .findReservationBetween(start,end);
        System.out.println("reservation 리스트 : " + reservationList);
        List<ReservationDTO> testReservationList = testReservationMapper.findTestReservationBetween(start,end);
        System.out.println("testReservation 리스트 : "+ testReservationList);
        List<ReservationDTO> operationList = operationMapper.findOperationBetween(start,end);
        System.out.println("Opertation 리스트 : " + operationList);

        reservationList.addAll(testReservationList);
        reservationList.addAll(operationList);



        if(reservationList != null && !reservationList.isEmpty()){
        for (ReservationDTO res : reservationList){
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            String time = timeFormat.format(res.getReservationDate());
            if(res.getType() == null){
                res.setType("진료");
            }
            String message = String.format(
                            "[병원예약 알림]\n" +
                            "병원에서 알려드립니다.\n" +
                            "%s님! 내일 %s시에 %s 의사님과의\n" +
                            " %s 예약이 있습니다!\n" +
                            "▼만약 예약을 변경하거나 취소하시려면\n" +
                            "http://localhost:3000/user/mypage",
                    res.getName(),
                    time,
                    res.getDoctorName(),
                    res.getType()
            );
            emailService.sendEmail(/*res.getEmail()*/ testEmail, "예약 알림", message);
        }
            System.out.println(reservationList);
            System.out.println("메일 발송 완료!");
        }
    }
}
