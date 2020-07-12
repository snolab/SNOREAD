@echo off && chcp 65001
REM 将文件或文件夹test压缩为test.zip
powershell Compress-Archive -Path ./src -DestinationPath ./dist/SNOREAD_CHROME_EXTENSION.zip -Force