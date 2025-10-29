package com.mediSync.project.service;

import com.mediSync.project.dto.CalendarDTO;
import com.mediSync.project.mapper.CalendarMapper;
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
