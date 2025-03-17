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

REM Run Prisma migrations
echo Running Prisma migrations...
bun prisma migrate dev

REM Generate Prisma client
echo Generating Prisma client...
bun prisma generate

REM Start the development server in a new terminal
echo Starting the development server...
start cmd /k "bun run dev"

REM Change directory to websockers and run index.ts in a new terminal
echo Changing directory to websockers and running index.ts...
start cmd /k "cd /d websockers && bun run index.ts"