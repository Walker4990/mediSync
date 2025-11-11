package com.mediSync.project.insurance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InsurerScheduler {
    private final InsurerSyncService syncService;

    @Scheduled(cron = "0 0 4 * * *", zone = "Asia/Seoul")
    public void nightSync() {
        syncService.syncMock();
        System.out.println("동기화 완료");
    }
}
