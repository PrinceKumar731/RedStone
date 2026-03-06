package com.example.demo.service;

import com.example.demo.dto.World;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class DashboardPropertiesService {
    private Path folderPath;

    public DashboardPropertiesService(PathService pathService) {
        this.folderPath = pathService.getMinecraftDir();
    }

    public String setWorldProperties(World world) throws IOException {
        try{
            String props = world.getLevelName()+".properties";
            Path path = folderPath.resolve(world.getVersionId()).resolve("properties").resolve(props);
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

    public World getWorldProperties(String versionId, String worldName) throws IOException {

        World world = new World();
        world.setVersionId(versionId);
        world.setLevelName(worldName);

        String props = worldName + ".properties";

        Path path = folderPath.resolve(versionId).resolve("properties").resolve(props);

        System.out.println("Reading properties file...");

        List<String> lines = Files.readAllLines(path);

        for (String line : lines) {

            if (line.startsWith("difficulty="))
                world.setDifficulty(line.split("=")[1]);

            else if (line.startsWith("gamemode="))
                world.setGamemode(line.split("=")[1]);

            else if (line.startsWith("level-name="))
                world.setLevelName(line.split("=")[1]);

            else if (line.startsWith("max-players="))
                world.setMaxPlayers(Integer.parseInt(line.split("=")[1]));

            else if (line.startsWith("allow-flight="))
                world.setAllowFlight(Boolean.parseBoolean(line.split("=")[1]));

            else if (line.startsWith("force-gamemode="))
                world.setForceGamemode(Boolean.parseBoolean(line.split("=")[1]));

            else if (line.startsWith("online-mode="))
                world.setOnlineMode(Boolean.parseBoolean(line.split("=")[1]));

            else if (line.startsWith("white-list="))
                world.setWhiteList(Boolean.parseBoolean(line.split("=")[1]));

            else if (line.startsWith("spawn-protection="))
                world.setSpawnProtection(Integer.parseInt(line.split("=")[1]));
        }

        System.out.println("Properties loaded successfully");

        return world;
    }

    public String getServerLink() throws SocketException, UnknownHostException {
        DatagramSocket socket = new DatagramSocket();
        socket.connect(InetAddress.getByName("8.8.8.8"), 10002);

        String ip = socket.getLocalAddress().getHostAddress();
        socket.close();

        return ip+":25565";
    }
}
