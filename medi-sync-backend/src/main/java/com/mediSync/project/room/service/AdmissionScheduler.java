package com.mediSync.project.room.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdmissionScheduler {
    private final AdmissionService admissionService;

    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void runAdmissionProcess() {
        log.info("[Scheduler] 입원 스케줄러 실행");
        admissionService.processScheduledAdmission();
    }


}
