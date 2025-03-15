import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../prisma/client';

export async function GET(request: NextRequest) {
    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        // Get the userId from cookies
        const userId = request.cookies.get('userId')?.value;

        if (!userId) {
            return new NextResponse(
                JSON.stringify({ 
                    success: false, 
                    message: 'Not authenticated' 
                }),
                { status: 401, headers }
            );
        }

        try {
            // Parse userId as integer and handle invalid input
            const userIdInt = parseInt(userId);
            
            if (isNaN(userIdInt)) {
                return new NextResponse(
                    JSON.stringify({ 
                        success: false, 
                        message: 'Invalid user ID format' 
                    }),
                    { status: 400, headers }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: userIdInt }
            });

            if (!user) {
                return new NextResponse(
                    JSON.stringify({ 
                        success: false, 
                        message: 'User not found' 
                    }),
                    { status: 404, headers }
                );
            }

            return new NextResponse(
                JSON.stringify({
                    success: true,
                    id: user.id,
                    username: user.username
                }),
                { status: 200, headers }
            );
        } catch (dbError) {
            console.error('Database error fetching user:', dbError);
            return new NextResponse(
                JSON.stringify({ 
                    success: false, 
                    message: 'Database error fetching user' 
                }),
                { status: 500, headers }
            );
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return new NextResponse(
            JSON.stringify({ 
                success: false, 
                message: 'Server error' 
            }),
            { status: 500, headers }
        );
    }
}
