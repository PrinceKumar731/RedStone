package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class PathService {

    private final Path baseDir;
    private final Path minecraftDir;

    public PathService() {

        // directory where the jar is executed
        this.baseDir = Paths.get(System.getProperty("user.dir"));

        // minecraft server folder inside it
        this.minecraftDir = baseDir.resolve("minecraft-server");

        System.out.println("BaseDir: " + baseDir);
        System.out.println("MinecraftDir: " + minecraftDir);
    }

    public Path getBaseDir() {
        return baseDir;
    }

    public Path getMinecraftDir() {
        return minecraftDir;
    }
}