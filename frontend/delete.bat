REM filepath: c:\Users\HP\Desktop\TGBH_CheeseBurger\frontend\delete_and_run.bat
@echo off
REM Delete node_modules directory
if exist node_modules (
    echo Deleting node_modules directory...
    rmdir /s /q node_modules
)

REM Install dependencies using bun
echo Installing dependencies using bun...
bun install