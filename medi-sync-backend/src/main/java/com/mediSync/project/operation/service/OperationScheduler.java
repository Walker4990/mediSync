package com.mediSync.project.operation.service;

import com.mediSync.project.operation.mapper.OperationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OperationScheduler {

    private final OperationMapper operationMapper;

    @Scheduled(cron = "0 * * * * *")
    public void updateOperationStatus(){
        int scheduledToProgress = operationMapper.updateScheduledToProgress();
        int progressToCompleted = operationMapper.updateProgressToCompleted();

        if (scheduledToProgress + progressToCompleted > 0) {
            log.info("✅ 수술 상태 자동 갱신: 예정→진행 {}건, 진행→완료 {}건",
                    scheduledToProgress, progressToCompleted);
        }

    }
}
