#!/bin/bash

# Open Visual Studio Code
code &

# Wait for VSCode to open
sleep 5

# Send keys to the terminal inside VSCode to run npm start
xdotool search --onlyvisible --class "code" windowactivate --sync key --clearmodifiers ctrl+` npm start` 

exit 0
