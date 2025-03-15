# PostgreSQL Connection using Docker and Prisma

## Prerequisites
- Docker installed on your system
- Node.js and npm installed
- Prisma CLI installed (`npm install -g prisma`)

## Step 1: Run PostgreSQL in Docker
Execute the following command to start a PostgreSQL container:
```sh
docker run -d --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_USER=myuser -e POSTGRES_DB=mydb \
-p 5432:5432 postgres
```

## Step 2: Initialize Prisma
Run the following command to initialize Prisma in your project:
```sh
npx prisma init
```
This will generate a `prisma` folder with a `schema.prisma` file and an `.env` file.

## Step 3: Configure Prisma for PostgreSQL
Update your `.env` file with the following database connection string:
```env
DATABASE_URL="postgresql://myuser:mysecretpassword@localhost:5432/mydb?schema=public"
```
## Prisma Schema
![Image](https://github.com/user-attachments/assets/a4673ab0-4a52-40b4-b502-19285b81119c)

## Step 4: Migrate the Database
Run the following command to apply the migration:
```sh
npx prisma migrate dev
```
You'll be prompted to enter a migration name, e.g., `shield`.

## Step 5: Generate Prisma Client
Generate the Prisma client by running:
```sh
npx prisma generate
```

## Step 6: Open Prisma Studio (Optional)
You can open Prisma Studio to explore the database with:
```sh
npx prisma studio
```
This will launch Prisma Studio at `http://localhost:5555`.

## Step 7: Use Prisma in Code
Create a `script.js` file and add the following:
```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  });
  console.log(user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```
Run the script:
```sh
node script.js
```

## Conclusion
You have now successfully set up PostgreSQL using Docker and connected it with Prisma. You can use Prisma Client to interact with the database in your application!

