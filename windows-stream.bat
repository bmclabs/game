@echo off
REM Battle Memecoin Club - Windows Streaming Script
REM This script runs the streaming setup directly from Windows

echo === Battle Memecoin Club - Windows Streaming ===
echo This script runs the streaming setup directly from Windows.
echo.

REM Check for required tools
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    exit /b 1
)

where ffmpeg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo FFmpeg is not installed or not in PATH.
    echo Please install FFmpeg from https://ffmpeg.org/download.html
    exit /b 1
)

REM Configuration
set FRAMERATE=30
set BITRATE=4500k
set MAXRATE=4500k
set BUFSIZE=9000k
set STREAM_URL=rtmp://live.twitch.tv/app/live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9
set GAME_URL=http://localhost:8080

REM Kill any existing processes
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Python HTTP Server" >nul 2>&1
taskkill /F /IM ffmpeg.exe >nul 2>&1

REM Create screenshots directory
if not exist screenshots mkdir screenshots

REM Modify game.js for full cycle (preparation + battle)
echo Modifying game.js for full cycle...
set GAME_JS_PATH=src\game.js
set BACKUP_PATH=src\game.js.backup

REM Create backup if it doesn't exist
if not exist %BACKUP_PATH% (
    copy %GAME_JS_PATH% %BACKUP_PATH%
    echo Created backup of game.js
)

REM Create modified game.js
echo const config = {> %GAME_JS_PATH%
echo     type: Phaser.CANVAS, // Force CANVAS renderer instead of AUTO>> %GAME_JS_PATH%
echo     parent: 'renderDiv',>> %GAME_JS_PATH%
echo     scale: {>> %GAME_JS_PATH%
echo         mode: Phaser.Scale.FIT,>> %GAME_JS_PATH%
echo         autoCenter: Phaser.Scale.CENTER_BOTH,>> %GAME_JS_PATH%
echo         width: 800,>> %GAME_JS_PATH%
echo         height: 600>> %GAME_JS_PATH%
echo     },>> %GAME_JS_PATH%
echo     physics: {>> %GAME_JS_PATH%
echo         default: 'arcade',>> %GAME_JS_PATH%
echo         arcade: {>> %GAME_JS_PATH%
echo             gravity: { y: 0 },>> %GAME_JS_PATH%
echo             debug: false>> %GAME_JS_PATH%
echo         }>> %GAME_JS_PATH%
echo     },>> %GAME_JS_PATH%
echo     scene: [>> %GAME_JS_PATH%
echo         PreparationScene,>> %GAME_JS_PATH%
echo         BattleScene>> %GAME_JS_PATH%
echo     ],>> %GAME_JS_PATH%
echo     render: {>> %GAME_JS_PATH%
echo         transparent: false,>> %GAME_JS_PATH%
echo         antialias: false,>> %GAME_JS_PATH%
echo         pixelArt: false>> %GAME_JS_PATH%
echo     }>> %GAME_JS_PATH%
echo };>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo // Auto-match configuration>> %GAME_JS_PATH%
echo const AUTO_MATCH = {>> %GAME_JS_PATH%
echo     enabled: true,>> %GAME_JS_PATH%
echo     matchCount: 0,>> %GAME_JS_PATH%
echo     maxMatches: 100, // Increased to allow for more matches>> %GAME_JS_PATH%
echo     matchDuration: 180000,>> %GAME_JS_PATH%
echo     preparationDuration: 30000, // 30 seconds for preparation>> %GAME_JS_PATH%
echo     timeBetweenMatches: 5000 // 5 seconds between matches>> %GAME_JS_PATH%
echo };>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo // Make game globally accessible>> %GAME_JS_PATH%
echo let game;>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo // Initialize the game when the window loads>> %GAME_JS_PATH%
echo window.addEventListener('load', () =^> {>> %GAME_JS_PATH%
echo     console.log('Starting auto-match mode with preparation cycle');>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Create the game instance>> %GAME_JS_PATH%
echo     game = new Phaser.Game(config);>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Make game globally accessible>> %GAME_JS_PATH%
echo     window.game = game;>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Start with the preparation scene>> %GAME_JS_PATH%
echo     setTimeout(() =^> {>> %GAME_JS_PATH%
echo         startPreparationPhase();>> %GAME_JS_PATH%
echo         >> %GAME_JS_PATH%
echo         // Set up match cycling>> %GAME_JS_PATH%
echo         if (AUTO_MATCH.enabled) {>> %GAME_JS_PATH%
echo             // This interval will be used to check if we need to move to the next phase>> %GAME_JS_PATH%
echo             setInterval(() =^> {>> %GAME_JS_PATH%
echo                 // The scenes will handle their own transitions>> %GAME_JS_PATH%
echo                 console.log('Match cycle check...');>> %GAME_JS_PATH%
echo             }, 5000);>> %GAME_JS_PATH%
echo         }>> %GAME_JS_PATH%
echo     }, 2000); // Wait 2 seconds before starting>> %GAME_JS_PATH%
echo });>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo // Function to start the preparation phase>> %GAME_JS_PATH%
echo function startPreparationPhase() {>> %GAME_JS_PATH%
echo     console.log('Starting preparation phase...');>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Select random fighters for the next battle>> %GAME_JS_PATH%
echo     const availableFighters = [...CHARACTERS];>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Make sure we have at least two fighters>> %GAME_JS_PATH%
echo     if (availableFighters.length ^< 2) {>> %GAME_JS_PATH%
echo         console.error('Not enough fighters available');>> %GAME_JS_PATH%
echo         return;>> %GAME_JS_PATH%
echo     }>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Select random fighters>> %GAME_JS_PATH%
echo     const fighter1Index = Math.floor(Math.random() * availableFighters.length);>> %GAME_JS_PATH%
echo     const fighter1 = availableFighters[fighter1Index];>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Remove the first fighter from the array>> %GAME_JS_PATH%
echo     availableFighters.splice(fighter1Index, 1);>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Select second fighter>> %GAME_JS_PATH%
echo     const fighter2Index = Math.floor(Math.random() * availableFighters.length);>> %GAME_JS_PATH%
echo     const fighter2 = availableFighters[fighter2Index];>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     console.log('Selected fighters for next battle:', fighter1.name, 'vs', fighter2.name);>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo     // Start with the preparation scene>> %GAME_JS_PATH%
echo     game.scene.start('PreparationScene', {>> %GAME_JS_PATH%
echo         roundNumber: AUTO_MATCH.matchCount + 1,>> %GAME_JS_PATH%
echo         fighter1Stats: fighter1,>> %GAME_JS_PATH%
echo         fighter2Stats: fighter2,>> %GAME_JS_PATH%
echo         arenaNumber: Math.floor(Math.random() * 6) + 1,>> %GAME_JS_PATH%
echo         autoMode: true,>> %GAME_JS_PATH%
echo         preparationDuration: AUTO_MATCH.preparationDuration>> %GAME_JS_PATH%
echo     });>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // After preparation duration, automatically start battle>> %GAME_JS_PATH%
echo     setTimeout(() =^> {>> %GAME_JS_PATH%
echo         startBattlePhase(fighter1, fighter2);>> %GAME_JS_PATH%
echo     }, AUTO_MATCH.preparationDuration);>> %GAME_JS_PATH%
echo }>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo // Function to start the battle phase>> %GAME_JS_PATH%
echo function startBattlePhase(fighter1, fighter2) {>> %GAME_JS_PATH%
echo     console.log('Starting battle phase:', fighter1.name, 'vs', fighter2.name);>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // Start the battle scene>> %GAME_JS_PATH%
echo     game.scene.start('BattleScene', {>> %GAME_JS_PATH%
echo         roundNumber: AUTO_MATCH.matchCount + 1,>> %GAME_JS_PATH%
echo         fighter1Stats: fighter1,>> %GAME_JS_PATH%
echo         fighter2Stats: fighter2,>> %GAME_JS_PATH%
echo         arenaNumber: Math.floor(Math.random() * 6) + 1,>> %GAME_JS_PATH%
echo         autoMode: true>> %GAME_JS_PATH%
echo     });>> %GAME_JS_PATH%
echo     >> %GAME_JS_PATH%
echo     // After battle duration, go back to preparation for next match>> %GAME_JS_PATH%
echo     setTimeout(() =^> {>> %GAME_JS_PATH%
echo         AUTO_MATCH.matchCount++;>> %GAME_JS_PATH%
echo         if (AUTO_MATCH.matchCount ^< AUTO_MATCH.maxMatches) {>> %GAME_JS_PATH%
echo             console.log(`Battle ${AUTO_MATCH.matchCount} completed. Starting next match...`);>> %GAME_JS_PATH%
echo             setTimeout(() =^> {>> %GAME_JS_PATH%
echo                 startPreparationPhase();>> %GAME_JS_PATH%
echo             }, AUTO_MATCH.timeBetweenMatches);>> %GAME_JS_PATH%
echo         } else {>> %GAME_JS_PATH%
echo             console.log('All matches completed');>> %GAME_JS_PATH%
echo         }>> %GAME_JS_PATH%
echo     }, AUTO_MATCH.matchDuration);>> %GAME_JS_PATH%
echo }>> %GAME_JS_PATH%
echo.>> %GAME_JS_PATH%
echo // Force rendering for headless mode>> %GAME_JS_PATH%
echo setInterval(() =^> {>> %GAME_JS_PATH%
echo     if (game ^&^& game.renderer) {>> %GAME_JS_PATH%
echo         // Force a redraw>> %GAME_JS_PATH%
echo         game.renderer.resize(800, 600);>> %GAME_JS_PATH%
echo         console.log('Forced renderer update');>> %GAME_JS_PATH%
echo     }>> %GAME_JS_PATH%
echo }, 5000);>> %GAME_JS_PATH%

echo Modified game.js for full cycle

REM Start HTTP server
echo Starting HTTP server...
start "Python HTTP Server" /B python -m http.server 8080
timeout /t 2 >nul

REM Start browser
echo Starting Chrome...
start "Battle Memecoin Club" chrome --new-window --window-size=800,600 --app=%GAME_URL%

REM Wait for game to load
echo Waiting for game to load (20 seconds)...
timeout /t 20 >nul

REM Take a screenshot
echo Taking a screenshot...
if exist "C:\Windows\System32\SnippingTool.exe" (
    start "" "C:\Windows\System32\SnippingTool.exe" /clip
    echo Please take a screenshot manually using the Snipping Tool
    timeout /t 5 >nul
)

REM Start FFmpeg to capture the window and stream
echo Starting FFmpeg streaming...
echo Stream URL: %STREAM_URL:~0,30%*****

REM Find the window title
for /f "tokens=*" %%a in ('tasklist /v ^| findstr "Battle Memecoin Club"') do (
    set WINDOW_INFO=%%a
)

REM Start FFmpeg with gdigrab to capture the window
ffmpeg -f gdigrab -framerate %FRAMERATE% -i title="Battle Memecoin Club" ^
  -c:v libx264 -preset ultrafast -tune zerolatency ^
  -b:v %BITRATE% -maxrate %MAXRATE% -bufsize %BUFSIZE% -g %FRAMERATE%*2 ^
  -pix_fmt yuv420p -profile:v main -level 4.0 ^
  -keyint_min %FRAMERATE% -f flv %STREAM_URL%

REM Cleanup
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Python HTTP Server" >nul 2>&1

REM Restore original game.js
copy %BACKUP_PATH% %GAME_JS_PATH% >nul
echo Restored original game.js

echo Streaming ended, cleaned up processes 