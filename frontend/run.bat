

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