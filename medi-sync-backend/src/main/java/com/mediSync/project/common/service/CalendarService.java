package com.mediSync.project.common.service;

import com.mediSync.project.common.dto.CalendarDTO;
import com.mediSync.project.common.mapper.CalendarMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private  final CalendarMapper calendarMapper;
    public List<CalendarDTO> getUserCalendar(Integer userId){
       return calendarMapper.getUserCalendar(userId);
    }

}
