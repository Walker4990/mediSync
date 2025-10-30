package com.mediSync.project.common.mapper;

import com.mediSync.project.common.dto.CalendarDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CalendarMapper {
    List<CalendarDTO> getUserCalendar(Integer userId);
}
