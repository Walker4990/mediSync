package com.mediSync.project.service;

import com.mediSync.project.mapper.ReservationMapper;
import com.mediSync.project.vo.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationScheduler {

    private final ReservationMapper reservationMapper;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 9 * * ?")
    public void sendReservationReminders(){
        LocalDateTime start = LocalDateTime.now().plusDays(1)
                                                    .withHour(0)
                                                    .withMinute(0)
                                                    .withSecond(0);

        LocalDateTime end = start.plusDays(1);

        List<Reservation> reservationList = reservationMapper
                                .findReservationBetween(start,end);

        
    }
}
