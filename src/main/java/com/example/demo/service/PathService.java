package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;

@Service
public class PathService {

    private final Path baseDir;
    private final Path minecraftDir;

    public PathService() {
        try {
            String location = PathService.class
                    .getProtectionDomain()
                    .getCodeSource()
                    .getLocation()
                    .toURI()
                    .getPath();

            System.out.println(location);

// find RedStone directory in the path
            int index = location.indexOf("RedStone");

            if (index == -1) {
                throw new RuntimeException("RedStone directory not found in path: " + location);
            }

            String redstonePath = location.substring(0, index + "RedStone".length());

            if (redstonePath.startsWith("/")) {
                redstonePath = redstonePath.substring(1);
            }

            this.baseDir = Path.of(redstonePath);
            this.minecraftDir = baseDir.resolve("minecraft-server");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Path getBaseDir() {
        return baseDir;
    }

    public Path getMinecraftDir() {
        return minecraftDir;
    }

    public static void main(String[] args) {
        PathService service = new PathService();
        System.out.println(service.getBaseDir());
        System.out.println(service.getMinecraftDir());
    }
}