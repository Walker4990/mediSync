package com.mediSync.project.finance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WebhookLogMapper {
    int existsByPaymentKeyAndEventType(@Param("paymentKey") String paymentKey, @Param("eventType") String eventType);

    void insertLog(@Param("paymentKey") String paymentKey, @Param("eventType") String eventType, @Param("rawPayload") String rawPayload);
}
