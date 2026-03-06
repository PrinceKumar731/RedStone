package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class WorldProperties {
        @JsonProperty("accepts-transfers")
        private boolean acceptsTransfers;

        @JsonProperty("allow-flight")
        private boolean allowFlight;

        @JsonProperty("broadcast-console-to-ops")
        private boolean broadcastConsoleToOps;

        @JsonProperty("broadcast-rcon-to-ops")
        private boolean broadcastRconToOps;

        @JsonProperty("bug-report-link")
        private String bugReportLink;

        private String difficulty;

        @JsonProperty("enable-code-of-conduct")
        private boolean enableCodeOfConduct;

        @JsonProperty("enable-jmx-monitoring")
        private boolean enableJmxMonitoring;

        @JsonProperty("enable-query")
        private boolean enableQuery;

        @JsonProperty("enable-rcon")
        private boolean enableRcon;

        @JsonProperty("enable-status")
        private boolean enableStatus;

        @JsonProperty("enforce-secure-profile")
        private boolean enforceSecureProfile;

        @JsonProperty("enforce-whitelist")
        private boolean enforceWhitelist;

        @JsonProperty("entity-broadcast-range-percentage")
        private int entityBroadcastRangePercentage;

        @JsonProperty("force-gamemode")
        private boolean forceGamemode;

        @JsonProperty("function-permission-level")
        private int functionPermissionLevel;

        private String gamemode;

        @JsonProperty("generate-structures")
        private boolean generateStructures;

        @JsonProperty("generator-settings")
        private String generatorSettings;

        private boolean hardcore;

        @JsonProperty("hide-online-players")
        private boolean hideOnlinePlayers;

        @JsonProperty("initial-disabled-packs")
        private String initialDisabledPacks;

        @JsonProperty("initial-enabled-packs")
        private String initialEnabledPacks;

        @JsonProperty("level-name")
        private String levelName;

        @JsonProperty("level-seed")
        private String levelSeed;

        @JsonProperty("level-type")
        private String levelType;

        @JsonProperty("log-ips")
        private boolean logIps;

        @JsonProperty("max-chained-neighbor-updates")
        private int maxChainedNeighborUpdates;

        @JsonProperty("max-players")
        private int maxPlayers;

        @JsonProperty("max-tick-time")
        private int maxTickTime;

        @JsonProperty("max-world-size")
        private int maxWorldSize;

        private String motd;

        @JsonProperty("network-compression-threshold")
        private int networkCompressionThreshold;

        @JsonProperty("online-mode")
        private boolean onlineMode;

        @JsonProperty("op-permission-level")
        private int opPermissionLevel;

        @JsonProperty("pause-when-empty-seconds")
        private int pauseWhenEmptySeconds;

        @JsonProperty("player-idle-timeout")
        private int playerIdleTimeout;

        @JsonProperty("prevent-proxy-connections")
        private boolean preventProxyConnections;

        @JsonProperty("query.port")
        private int queryPort;

        @JsonProperty("rate-limit")
        private int rateLimit;

        @JsonProperty("rcon.password")
        private String rconPassword;

        @JsonProperty("rcon.port")
        private int rconPort;

        @JsonProperty("region-file-compression")
        private String regionFileCompression;

        @JsonProperty("require-resource-pack")
        private boolean requireResourcePack;

        @JsonProperty("resource-pack")
        private String resourcePack;

        @JsonProperty("resource-pack-id")
        private String resourcePackId;

        @JsonProperty("resource-pack-prompt")
        private String resourcePackPrompt;

        @JsonProperty("resource-pack-sha1")
        private String resourcePackSha1;

        @JsonProperty("server-ip")
        private String serverIp;

        @JsonProperty("server-port")
        private int serverPort;

        @JsonProperty("simulation-distance")
        private int simulationDistance;

        @JsonProperty("spawn-protection")
        private int spawnProtection;

        @JsonProperty("status-heartbeat-interval")
        private int statusHeartbeatInterval;

        @JsonProperty("sync-chunk-writes")
        private boolean syncChunkWrites;

        @JsonProperty("text-filtering-config")
        private String textFilteringConfig;

        @JsonProperty("text-filtering-version")
        private int textFilteringVersion;

        @JsonProperty("use-native-transport")
        private boolean useNativeTransport;

        @JsonProperty("view-distance")
        private int viewDistance;

        @JsonProperty("white-list")
        private boolean whiteList;

}
