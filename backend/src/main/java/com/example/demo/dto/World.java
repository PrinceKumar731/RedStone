package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class World {

        @JsonProperty("versionId")
        private String versionId;

        @JsonProperty("level-name")
        private String levelName;

        @JsonProperty("max-players")
        private int maxPlayers;

        @JsonProperty("gamemode")
        private String gamemode;

        @JsonProperty("difficulty")
        private String difficulty;

        @JsonProperty("white-list")
        private Boolean whiteList;

        private Boolean cracked;

        @JsonProperty("online-mode")
        private Boolean onlineMode;

        @JsonProperty("allow-flight")
        private Boolean allowFlight;

        @JsonProperty("force-gamemode")
        private Boolean forceGamemode;

        @JsonProperty("spawn-protection")
        private int spawnProtection;
}