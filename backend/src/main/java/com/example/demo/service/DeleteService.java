package com.example.demo.service;

import com.example.demo.dto.VersionWithWorld;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DeleteService {
    private Path folderPath;

    public DeleteService(PathService pathService) {
        this.folderPath = pathService.getMinecraftDir();
    }

    public String removeInVersionsJson(String versionId){
        try{
            Path path = folderPath.resolve("versions.json");
            File file = path.toFile();
            ObjectMapper objectMapper = new ObjectMapper();
            List<VersionWithWorld> versions =
                    objectMapper.readValue(file,
                            new TypeReference<List<VersionWithWorld>>() {});

            for(VersionWithWorld versionWithWorld : versions){
                if(versionWithWorld.getVersionId().equals(versionId)){
                    versions.remove(versionWithWorld);
                    break;
                }
            }

            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, versions);
            return "Success";
        }catch(Exception e){
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public String removeServer(String versionId){
        try{
            Path path = folderPath.resolve(versionId);
            Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });
            return "Success";
        }catch(Exception e){
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public String deleteServer(String versionId) throws IOException {
        try{
            System.out.println("remove version");
            if(removeInVersionsJson(versionId).equals("Failure"))throw new RuntimeException();
            System.out.println("finished remove version");
            System.out.println("delete version");
            if(removeServer(versionId).equals("Failure"))throw new RuntimeException();
            System.out.println("finished delete version");
            return "Success";
        }catch (Exception e){
            System.out.println(e.getMessage());
            return "Failure";
        }
    }



    public String deleteWorldProperties(String versionId,String worldName) throws IOException {
        try{
            Path filePath = folderPath.resolve(versionId).resolve("properties").resolve(worldName+".properties");
            Files.deleteIfExists(filePath);
            return "Success";
        }catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public String deleteWorldFile(String versionId,String worldName) throws IOException {
        try{
            Path filePath = folderPath.resolve(versionId).resolve(worldName);
            Files.walk(filePath)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });
            return "Success";
        }catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public String updateVersionsJson(String versionId, String worldName){
        try{
            Path path = folderPath.resolve("versions.json");
            File file = path.toFile();
            ObjectMapper objectMapper = new ObjectMapper();
            List<VersionWithWorld> versions =
                    objectMapper.readValue(file,
                            new TypeReference<List<VersionWithWorld>>() {});

            for(VersionWithWorld versionWithWorld : versions){
                if(versionWithWorld.getVersionId().equals(versionId)){
                    for(String world : versionWithWorld.getWorlds()){
                        if(world.equals(worldName)){
                            versionWithWorld.getWorlds().remove(worldName);
                            break;
                        }
                    }
                }
            }
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, versions);
            return "Success";
        }catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return "Failure";
        }
    }

    public String deleteWorld(String versionId, String worldName) throws IOException {
        try{
            System.out.println("remove json started");
            if(updateVersionsJson(versionId,worldName).equals("Failure"))throw new RuntimeException();
            System.out.println("remove json finished");

            System.out.println("remove world started");
            if(deleteWorldProperties(versionId,worldName).equals("Failure"))throw new RuntimeException();
            System.out.println("remove world finished");

            System.out.println("remove world started");
            if(deleteWorldFile(versionId,worldName).equals("Failure"))throw new RuntimeException();
            System.out.println("remove world finished");

            return "Success";
        }catch(Exception e){
            e.printStackTrace();
            System.out.println(e.getMessage());
            return "Failure";
        }
    }
}
