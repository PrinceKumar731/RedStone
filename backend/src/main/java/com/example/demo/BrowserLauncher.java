package com.example.demo;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BrowserLauncher {

    @EventListener(ApplicationReadyEvent.class)
    public void openBrowser() {

        String url = "http://localhost:8080";

        new Thread(() -> {
            try {

                // small delay to ensure server is ready
                Thread.sleep(1500);

                String os = System.getProperty("os.name").toLowerCase();

                if (os.contains("win")) {
                    new ProcessBuilder("cmd", "/c", "start", url).start();
                }
                else if (os.contains("mac")) {
                    new ProcessBuilder("open", url).start();
                }
                else {
                    new ProcessBuilder("xdg-open", url).start();
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
}