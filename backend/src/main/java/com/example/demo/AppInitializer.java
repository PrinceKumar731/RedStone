package com.example.demo;

import com.example.demo.service.PathService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class AppInitializer {

    private final PathService pathService;

    public AppInitializer(PathService pathService) {
        this.pathService = pathService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        try {

            Path baseDir = pathService.getBaseDir();
            Path minecraftDir = pathService.getMinecraftDir();

            // ensure folders exist
            Files.createDirectories(minecraftDir);
            Files.createDirectories(baseDir.resolve("config"));
            Files.createDirectories(baseDir.resolve("logs"));

            // ensure versions.json exists
            Path versionsFile = minecraftDir.resolve("versions.json");

            if (!Files.exists(versionsFile)) {

                String defaultJson = "[]";

                Files.writeString(versionsFile, defaultJson);
            }
            try {
                Runtime.getRuntime().exec(
                        "netsh advfirewall firewall add rule name=\"RedStone\" dir=in action=allow protocol=TCP localport=25565"
                );
            } catch (Exception ignored) {}
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}