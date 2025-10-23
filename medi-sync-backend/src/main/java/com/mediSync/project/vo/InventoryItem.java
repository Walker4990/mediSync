package com.mediSync.project.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Alias("inven")
public class InventoryItem {
    private Integer item_id;

}
