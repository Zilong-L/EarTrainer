#!/bin/bash
sed -i 's|<link rel="icon" type="image/svg+xml" href="/vite.svg" />|<link rel="icon" type="image/png" href="/biglogo.png" />|' ./dist/index.html
sed -i 's|<title>Vite + React</title>|<title>Chord Trainer</title>|' ./dist/index.html
