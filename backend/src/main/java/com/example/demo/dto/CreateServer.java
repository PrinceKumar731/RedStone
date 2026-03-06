package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateServer {
    private String name;
    private String world;
    private Integer port;
    private String difficulty;
    private String gamemode;
    private Integer maxPlayers;
    private String ram;
}
