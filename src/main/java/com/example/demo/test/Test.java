package com.example.demo.test;

import java.net.*;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Test {

    public static void main(String[] args) throws Exception {

        Path appDir = Paths.get("").toAbsolutePath();
        Path minecraftDir = appDir.resolve("minecraft");
        System.out.println(appDir);
        System.out.println(minecraftDir);
}
}