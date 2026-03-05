package com.example.demo.test;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Scanner;
import java.util.concurrent.Executors;

public class Test {

    private static Process serverProcess;

    public static void startServer() throws IOException {

        ProcessBuilder pb = new ProcessBuilder(
                "cmd.exe", "/c", "New-item","hero.properties"
        );

        pb.directory(new File("C:/minecraft-server/worlds"));
        pb.redirectErrorStream(true);

        serverProcess = pb.start();

        System.out.println("New Server Started");

        Path source = Paths.get("C:/minecraft-server/server.properties");
        Path destination = Paths.get("C:/minecraft-server/worlds/hero.properties");

        Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("File copied successfully");

        System.out.println(Files.readAllLines(destination));

    }

    public static void main(String[] args) throws IOException {
        startServer();
    }
}
