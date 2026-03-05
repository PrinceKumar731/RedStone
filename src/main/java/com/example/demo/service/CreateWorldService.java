package com.example.demo.service;

import com.example.demo.dto.CreateServer;
import com.example.demo.dto.VersionWithWorld;
import com.example.demo.dto.VersionsJson;
import com.example.demo.dto.World;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class CreateWorldService {
    private String folderPath = "C:\\minecraft-server";

    public String copyProperties(World world) throws IOException {
        Path folder = Paths.get(folderPath,world.getVersionId(),"properties");
        String finalAdress = world.getLevelName()+".properties";

        Path destination = folder.resolve(finalAdress);
        Path source =  folder.resolve("style.properties");

        Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
        return "Success";
    }

    public void deleteProperties(World world) throws IOException {
        Path folder = Paths.get(folderPath,world.getVersionId(),"properties");
        String props = world.getLevelName()+".properties";
        Path destination = folder.resolve(props);
        Files.deleteIfExists(destination);
    }

    public String updateProperties(World world) throws IOException {
        try{
            String props = world.getLevelName()+".properties";
            Path path = Paths.get(folderPath,world.getVersionId(),"properties",props);
            File file =  path.toFile();
            System.out.println("Updating properties file...");
            List<String> lines = Files.readAllLines(path);

            for (int i = 0; i < lines.size(); i++) {
                if (lines.get(i).startsWith("difficulty="))
                    lines.set(i, "difficulty=" + world.getDifficulty());

                else if (lines.get(i).startsWith("gamemode="))
                    lines.set(i, "gamemode=" + world.getGamemode());

                else if (lines.get(i).startsWith("level-name="))
                    lines.set(i, "level-name=" + world.getLevelName());

                else if (lines.get(i).startsWith("max-players="))
                    lines.set(i, "max-players=" + world.getMaxPlayers());

                else if (lines.get(i).startsWith("allow-flight="))
                    lines.set(i, "allow-flight=" + world.getAllowFlight());

                else if (lines.get(i).startsWith("force-gamemode="))
                    lines.set(i, "force-gamemode=" + world.getForceGamemode());

                else if (lines.get(i).startsWith("online-mode="))
                    lines.set(i, "online-mode=" + world.getOnlineMode());

                else if (lines.get(i).startsWith("white-list="))
                    lines.set(i, "white-list=" + world.getWhiteList());

                else if (lines.get(i).startsWith("spawn-protection="))
                    lines.set(i, "spawn-protection=" + world.getSpawnProtection());
            }

            Files.write(path, lines);
            System.out.println("Update props files.......");
            return "Success";
        }catch(Exception e){
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public String updateVersionJson(World world) throws IOException {
        try{
            Path path = Paths.get(folderPath,"versions.json");
            File file = path.toFile();
            ObjectMapper objectMapper = new ObjectMapper();
            List<VersionWithWorld> versions =
                    objectMapper.readValue(file,
                            new TypeReference<List<VersionWithWorld>>() {});

            for(VersionWithWorld versionWithWorld : versions){
                System.out.println(versionWithWorld.getVersionId());
                System.out.println(world.getVersionId());
                if(versionWithWorld.getVersionId().equals(world.getVersionId())){
                    System.out.println(versionWithWorld);
                    if (versionWithWorld.getWorlds() == null) {
                        versionWithWorld.setWorlds(new ArrayList<>());
                    }
                    versionWithWorld.getWorlds().add(world.getLevelName());
                }
            }
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, versions);
            return "Success";
        }catch(Exception e){
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public void removeVersionJson(World world) throws IOException {
        Path path = Paths.get(folderPath,"versions.json");
        File file = path.toFile();
        ObjectMapper objectMapper = new ObjectMapper();
        List<VersionWithWorld> versions =
                objectMapper.readValue(file,
                        new TypeReference<List<VersionWithWorld>>() {});

        for(VersionWithWorld versionWithWorld : versions){
            if(versionWithWorld.getVersionId().equals(world.getVersionId())){
                for(String worldName : versionWithWorld.getWorlds()){
                    if(worldName.equals(world.getLevelName())){
                        versionWithWorld.getWorlds().remove(worldName);
                    }
                }
            }
        }
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, versions);
    }

    public String createWorld(World world) throws IOException {
        try {
            System.out.println(world);
            System.out.println("Copy properties started...");
            if (copyProperties(world).equals("Failure"))
                throw new RuntimeException("copying properties failed");
            System.out.println("Copy properties finished.");

            System.out.println("Update properties started...");
            if (updateProperties(world).equals("Failure"))
                throw new RuntimeException("updating properties failed");
            System.out.println("Update properties finished.");

            System.out.println("Update versions.json started...");
            if (updateVersionJson(world).equals("Failure"))
                throw new RuntimeException("updating versions failed");
            System.out.println("Update versions.json finished.");

            return "Success";

        } catch (Exception e) {
            System.out.println(e.getMessage());

            deleteProperties(world);
            removeVersionJson(world);

            e.printStackTrace();
            return "Failure";
        }
    }
}
