package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
public class ServerController {
    @Autowired
    private CreateServerService createServerService;

    @Autowired
    private ServerServerice serverServerice;

    @Autowired
    private CreateWorldService createWorldService;

    @Autowired
    private ServerManager serverManager;

    @Autowired
    private DashboardPropertiesService dashboardPropertiesService;

    @PostMapping("/servers")
    public void createServer(@RequestBody CreateServer createServer) {
        System.out.println(createServer);
    }

    @GetMapping("/offlineVersions")
    public List<String>getOfflineVersions(){
        return createServerService.getOfflineVersions();
    }

    @GetMapping("/onlineVersions")
    public List<Version> getOnlineVersions() {
        return createServerService.getOnlineVersions();
    }

    @PostMapping("download/{versionId}")
    public String downloadVersion(@PathVariable("versionId") String versionId) {
        return createServerService.downloadVersion(versionId);
    }

    @GetMapping("/eula/{versionId}")
    public String startServer(@PathVariable("versionId") String versionId) throws IOException {
        return createServerService.startServerForFirstTime(versionId);
    }

    @GetMapping("/AvailableServers")
    public List<VersionWithWorld> getAvailableServers() {
        return serverServerice.getAvailableServers();
    }


    @PostMapping("/world")
    public String createWorld(@RequestBody World world) throws IOException {
        return createWorldService.createWorld(world);
    }

    @GetMapping("/start/{versionId}/{worldName}")
    public String startServer(@PathVariable("versionId") String versionId, @PathVariable("worldName") String worldName) throws IOException {
        return  serverManager.startServer(versionId,worldName);
    }

    @GetMapping("/stop/{versionId}/{worldName}")
    public String stopServer(@PathVariable("versionId") String versionId, @PathVariable("worldName") String worldName) throws IOException {
        return serverManager.stopServer();
    }

    @GetMapping("/dashboard/{versionId}/{worldName}")
    public World showDashboard(@PathVariable("versionId") String versionId, @PathVariable("worldName") String worldName) throws IOException {
        return dashboardPropertiesService.getWorldProperties(versionId,worldName);
    }

    @PostMapping("/dashboard/{versionId}/{worldName}")
    public String saveDashboard(@PathVariable("versionId") String versionId, @PathVariable("worldName") String worldName, @RequestBody World world) throws IOException {
        return dashboardPropertiesService.setWorldProperties(world);
    }
}
