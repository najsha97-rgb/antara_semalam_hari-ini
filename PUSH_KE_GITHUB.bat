@echo off
chcp 65001 > nul
title PUSH ANTARA SEMALAM PWA KE GITHUB
cd /d "%~dp0"
echo ========================================================
echo   MENGHANTAR KEMASKINI PWA KE GITHUB
echo ========================================================
git add .
git commit -m "Kemas kini Antara Semalam dan Hari Ini Web PWA"
git push origin main
echo.
echo ========================================================
echo   ALHAMDULILLAH! BERJAYA DIHANTAR KE GITHUB.
echo ========================================================
pause

