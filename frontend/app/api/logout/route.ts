import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Create response headers with explicit Content-Type
        const headers = {
            'Content-Type': 'application/json'
        };

        // Create the response
        const response = new NextResponse(
            JSON.stringify({ 
                success: true,
                message: 'Logged out successfully'
            }),
            { status: 200, headers }
        );
        
        // Clear the userId cookie
        response.cookies.set({
            name: 'userId',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0, // Immediate expiration
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        // Return JSON even for unexpected errors
        return new NextResponse(
            JSON.stringify({ success: false, message: 'Internal server error during logout' }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
} 