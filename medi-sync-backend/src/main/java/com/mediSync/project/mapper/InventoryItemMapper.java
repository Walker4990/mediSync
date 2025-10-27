package com.mediSync.project.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface InventoryItemMapper {

    int decreaseQuantityByInven(@Param("itemName") String itemName,
                               @Param("usedQty") double usedQty);

}
