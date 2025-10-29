package com.mediSync.project.service;

import com.mediSync.project.dto.ReservationDTO;
import com.mediSync.project.mapper.ReservationMapper;
import com.mediSync.project.vo.Reservation;
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
    private final EmailService emailService;
    //(cron = "0 */5 * * * ?") << 5분간격
    //(cron = "0 0 9 * * ?") << 아침 9시

    //null시 << 이렇게 나오는거 수정

    //예약 전날 오전 9시에 알림
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendReservationReminders(){
        String testEmail  = "silvermoon4989@gmail.com";
        LocalDateTime start = LocalDateTime.now().plusDays(1)
                                                    .withHour(0)
                                                    .withMinute(0)
                                                    .withSecond(0);
        LocalDateTime end = start.plusDays(1);

        List<ReservationDTO> reservationList = reservationMapper
                                .findReservationBetween(start,end);

        for (ReservationDTO res : reservationList){
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            String time = timeFormat.format(res.getReservationDate());

            String message = String.format(
                            "[병원예약 알림]\n" +
                            "병원에서 알려드립니다.\n" +
                            "%s님! 내일 %s시에 %s 의사와의\n" +
                            "예약이 있습니다!\n" +
                            "▼만약 예약을 변경하거나 취소하시려면\n" +
                            "http://localhost:3000/user/consult",
                    res.getName(),
                    time,
                    res.getDoctorName());
            emailService.sendEmail(/*res.getEmail()*/ testEmail, "예약 알림", message);
        }
        System.out.println(reservationList);
        System.out.println("메일 발송 완료!");
    }
}
