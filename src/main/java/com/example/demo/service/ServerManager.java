package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ServerManager {

    @Autowired
    private ConsoleSocketService consoleSocketService;

    private Process server;

    public String copyProperties(String versionId, String worldName) throws IOException {
        try{
            Path path = Paths.get("C:\\minecraft-server", versionId);

            Path destination = path.resolve("server.properties");
            Path source = path.resolve("properties").resolve(worldName+".properties");

            Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("server.properties updated successfully");

            return "Success";

        }catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public void start(String versionId) {
        try {
            Path serverFolder = Paths.get("C:\\minecraft-server", versionId);

            ProcessBuilder pb = new ProcessBuilder(
                    "java",
                    "-Xmx4G",
                    "-jar",
                    "server.jar",
                    "nogui"
            );

            pb.directory(serverFolder.toFile());
            pb.redirectErrorStream(true);

            server = pb.start();

            BufferedReader reader =
                    new BufferedReader(new InputStreamReader(server.getInputStream()));

            // Start another thread to continue reading logs
            new Thread(() -> {
                try {
                    String l;
                    while ((l = reader.readLine()) != null) {
                        System.out.println("[SERVER] " + l);
                        consoleSocketService.sendLog(l); // send to frontend
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String stopServer() {
        try {

            if (server != null && server.isAlive()) {

                BufferedWriter writer =
                        new BufferedWriter(new OutputStreamWriter(server.getOutputStream()));

                writer.write("stop");
                writer.newLine();
                writer.flush();

            }

            return "Success";

        } catch (Exception e) {
            e.printStackTrace();
            return "Failure";
        }
    }

    public String startServer(String versionId, String worldName) throws IOException {
        try{

            if(copyProperties(versionId,worldName).equals("Failure"))throw new IOException();

            start(versionId);

            return "Success";
        }catch (Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return "Failure";
        }
    }
}
