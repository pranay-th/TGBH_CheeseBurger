import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Input validation
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return NextResponse.json(
                { success: false, message: 'Invalid username format' },
                { status: 400 }
            );
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return NextResponse.json(
                { success: false, message: 'Invalid password format' },
                { status: 400 }
            );
        }

        const trimmedUsername = username.trim();

        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username: trimmedUsername }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Verify password with constant-time comparison
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create initial event log for login
        await prisma.eventLog.create({
            data: {
                userId: user.id,
                eventType: 'LOGIN',
                details: 'User logged in successfully'
            }
        });

        // Set a secure session cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'userId',
            value: user.id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return NextResponse.json({ 
            success: true, 
            userId: user.id,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error during login' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
