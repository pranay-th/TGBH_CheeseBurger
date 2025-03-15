import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const submissions = await prisma.examSubmission.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { submittedAt: 'desc' },
            take: 1
        });

        return NextResponse.json({
            success: true,
            data: submissions[0] || null
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch results' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 