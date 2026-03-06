package com.example.demo.service;

import com.example.demo.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CreateServerService {
    private Path folderPath;

    private final WebClient webClient;


    public CreateServerService(WebClient.Builder builder,PathService pathService) {
        this.webClient = builder
                .build();
        this.folderPath = pathService.getMinecraftDir();
    }

    public List<String> getOfflineVersions(){
        List<String> offlineVersions = new ArrayList<>();

        File folders = folderPath.toFile();
        File[] listOfFiles = folders.listFiles();

        for (File file : listOfFiles) {
            if(file.getName().endsWith(".json")){continue;}
            offlineVersions.add(file.getName());
        }
        return offlineVersions;
    }

    public List<Version> getOnlineVersions(){
        VersionList versionList =  webClient.get()
                .uri("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")
                .retrieve()
                .bodyToMono(VersionList.class)
                .block();

        Integer totalServerCount = 0;
        List<Version> versions = new ArrayList<>();

        for(Version version : versionList.getVersions()){
            if(version.getType().equals("release")){
                totalServerCount++;
                versions.add(version);
            }
            if(totalServerCount >= 15) {
                break;
            }
        }
        System.out.println(versions);
        return versions;
    }



    public String getVersionUrl(String VersionId){
        List<Version> versions = getOnlineVersions();
        for(Version version : versions){
            if(version.getId().equals(VersionId)){
                return version.getUrl();
            }
        }
        return null;
    }

    public String getDownloadUrl(String VersionUrl){
        DownloadServerUrl tempDownloadUrl = webClient.get()
                .uri(VersionUrl)
                .retrieve()
                .bodyToMono(DownloadServerUrl.class)
                .block();

        String downloadUrl  = tempDownloadUrl.getDownloads().getServer().getUrl();
        return downloadUrl;
    }

    public String updateVersionJson(String VersionId, Boolean eula){
        try{
            Path path = folderPath.resolve("versions.json");
            File file = path.toFile();
            ObjectMapper objectMapper = new ObjectMapper();
            List<VersionWithWorld> versions =
                    objectMapper.readValue(file,
                            new TypeReference<List<VersionWithWorld>>() {});

            VersionWithWorld version = new VersionWithWorld();
            version.setVersionId(VersionId);
            version.setEula(eula);
            version.setWorlds(new ArrayList<>());

            versions.add(version);

            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, versions);

            return "Success";

        }catch (Exception ex){
            System.out.println(ex.getMessage());
            return "Failure";
        }
    }

    public String downloadVersion(String versionId) {

        Path downloadPath = folderPath.resolve(versionId);

        try {

            Files.createDirectories(downloadPath);

            String versionUrl = getVersionUrl(versionId);
            System.out.println("Downloading version " + versionUrl);
            if(versionUrl == null) return "Failure";

            String downloadUrl = getDownloadUrl(versionUrl);
            System.out.println("Downloading version " + versionUrl);
            if(downloadUrl == null) return "Failure";

            try (InputStream inputStream = new URL(downloadUrl).openStream()) {

                Files.copy(
                        inputStream,
                        downloadPath.resolve("server.jar"),
                        StandardCopyOption.REPLACE_EXISTING
                );
            }
            System.out.println("Successs");
            updateVersionJson(versionId,false);
            return "Success";

        } catch (Exception e) {

            try {
                Files.deleteIfExists(downloadPath);
            } catch (IOException ignored) {}

            return "Failure";
        }
    }



    public String startServer(String versionId) throws IOException, InterruptedException {
        try{
            Path serverFolder = folderPath.resolve(versionId);

            ProcessBuilder pb = new ProcessBuilder(
                    "java",
                    "-Xmx4G",
                    "-jar",
                    "server.jar",
                    "nogui"
            );

            pb.directory(serverFolder.toFile());
            pb.redirectErrorStream(true);

            System.out.println("Step 2: Starting Minecraft server...");

            Process server = pb.start();

            // Thread to print server console output
            new Thread(() -> {
                try (BufferedReader reader =
                             new BufferedReader(new InputStreamReader(server.getInputStream()))) {

                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("[SERVER] " + line);
                    }

                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();

            System.out.println("Step 3: Waiting for server to generate files...");

            boolean finished = server.waitFor(2, TimeUnit.MINUTES);

            if (!finished) {
                System.out.println("Server ran for initialization. Stopping it...");
                server.destroy();
            }

            return "Success";

        }catch (Exception e){
            return "Failure";
        }
    }

    public String updateEula(String versionId, Boolean eula){
        try{
            Path path = folderPath.resolve("versions.json");
            File file = path.toFile();
            ObjectMapper objectMapper = new ObjectMapper();
            List<VersionWithWorld> versions =
                    objectMapper.readValue(file,
                            new TypeReference<List<VersionWithWorld>>() {});

           for(VersionWithWorld version : versions){
               if(version.getVersionId().equals(versionId)){
                   version.setEula(eula);
                   break;
               }
           }

            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, versions);

            return "Success";

        }catch (Exception ex){
            System.out.println(ex.getMessage());
            return "Failure";
        }
    }

    public String agreeToEula(String versionId) throws IOException {

        Path path = folderPath.resolve(versionId).resolve("eula.txt");
        if (!Files.exists(path)) {
            return "Failure";
        }

        List<String> lines = new ArrayList<>(Files.readAllLines(path));

        boolean agree = false;

        for (int i = 0; i < lines.size(); i++) {

            if (lines.get(i).startsWith("eula")) {
                lines.set(i, "eula=true");
                agree = true;
                break;
            }

        }

        Files.write(path, lines);

        return agree ? "Success" : "Failure";
    }

    public String startServerForFirstTime(String versionId) {

        boolean eula = false;
        try {

            System.out.println("Step 1: Preparing server folder...");

            Path serverFolder = folderPath.resolve(versionId);

            String started = startServer(versionId);
            if(started.equals("Failure"))throw new RuntimeException("Server started successfully");

            System.out.println("Step 4: Agreeing to EULA...");

            String agreed = agreeToEula(versionId);
            if (agreed.equals("Failure"))throw new RuntimeException("Failed to agree to EULA");
            eula = true;

            System.out.println("EULA successfully accepted.");

            System.out.println("Step 5: Creating properties backup folder...");

            Path folder = serverFolder.resolve("properties");
            Files.createDirectories(folder);

            System.out.println("Properties folder created.");

            Path filePath = folder.resolve("style.properties");
            Path source = serverFolder.resolve("server.properties");

            if (!Files.exists(source)) {
                throw new RuntimeException("server.properties not found");
            }

            System.out.println("Step 6: Copying server.properties...");

            Files.copy(
                    source,
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            System.out.println("server.properties copied successfully.");

            System.out.println("Server first-time setup completed successfully.");

            return "Success";

        } catch (Exception e) {

            System.out.println("Error during setup: " + e.getMessage());
            e.printStackTrace();

            return "Failure";
        } finally {
            updateEula(versionId, eula);
        }
    }

}
