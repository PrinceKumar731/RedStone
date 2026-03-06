package com.example.demo.service;

import com.example.demo.dto.VersionWithWorld;
import com.example.demo.dto.VersionsJson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ServerServerice {
    private Path folderPath;

    public ServerServerice(PathService pathService) {
        this.folderPath = pathService.getMinecraftDir();
    }

    public List<VersionWithWorld> getAvailableServers(){
        Path path = folderPath.resolve("versions.json");
        File file = path.toFile();
        ObjectMapper objectMapper = new ObjectMapper();
        List<VersionWithWorld> versions =
                objectMapper.readValue(file,
                        new TypeReference<List<VersionWithWorld>>() {});
        System.out.println(versions);
        return versions;
    }
}
