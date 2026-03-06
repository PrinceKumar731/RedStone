package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Version {
    private String id;
    private String type;
    private String url;
    private String time;
    private String releaseTime;
}
