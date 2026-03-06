package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class DownloadServerUrl {
    private Downloads downloads;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Downloads {
        private Server server;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Server {
        private String url;
    }

}
