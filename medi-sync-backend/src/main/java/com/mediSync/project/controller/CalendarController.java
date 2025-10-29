package com.mediSync.project.controller;

import com.mediSync.project.dto.CalendarDTO;
import com.mediSync.project.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public List<CalendarDTO> getUserCalendar(
                                @RequestParam("userId") Integer userId){
        return calendarService.getUserCalendar(userId);
    }
}
