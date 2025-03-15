"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// prisma/client.js - converted from TypeScript
const { PrismaClient } = require("@prisma/client");

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Define global.prisma if it doesn't exist yet
const globalForPrisma = global;

// Initialize the prisma instance using a singleton pattern
exports.prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// Save the prisma instance to global in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = exports.prisma;
}
