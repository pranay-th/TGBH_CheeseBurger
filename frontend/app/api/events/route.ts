import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();
        console.log('Received request body:', body);

        const { type, userId } = body;

        // Basic validation
        if (!type || !userId) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: type and userId' },
                { status: 400 }
            );
        }

        // Convert userId to number
        const userIdNum = Number(userId);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userIdNum }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: `User not found with ID: ${userIdNum}` },
                { status: 404 }
            );
        }

        // Process different event types
        switch (type) {
            case 'keystroke': {
                const { keyPressed } = body;
                if (!keyPressed) {
                    return NextResponse.json(
                        { success: false, message: 'keyPressed is required for keystroke events' },
                        { status: 400 }
                    );
                }

                // Create keystroke record
                await prisma.keystroke.create({
                    data: {
                        userId: userIdNum,
                        keyPressed: String(keyPressed)
                    }
                });

                // Log event
                await prisma.eventLog.create({
                    data: {
                        userId: userIdNum,
                        eventType: 'keyispressed',
                        details: `Key pressed: ${keyPressed}`
                    }
                });

                break;
            }

            case 'mouseMovement': {
                const { xPos, yPos } = body;
                if (xPos === undefined || yPos === undefined) {
                    return NextResponse.json(
                        { success: false, message: 'xPos and yPos are required for mouseMovement events' },
                        { status: 400 }
                    );
                }

                // Convert to numbers
                const xPosNum = Number(xPos);
                const yPosNum = Number(yPos);

                // Create mouse movement record
                await prisma.mouseMovement.create({
                    data: {
                        userId: userIdNum,
                        xPos: xPosNum,
                        yPos: yPosNum
                    }
                });

                // Log event
                await prisma.eventLog.create({
                    data: {
                        userId: userIdNum,
                        eventType: 'mousemoved',
                        details: `Mouse moved to: (${xPosNum}, ${yPosNum})`
                    }
                });

                break;
            }

            case 'tabSwitch': {
                const { tabUrl } = body;
                if (!tabUrl) {
                    return NextResponse.json(
                        { success: false, message: 'tabUrl is required for tabSwitch events' },
                        { status: 400 }
                    );
                }

                // Create tab switch record
                await prisma.tabSwitch.create({
                    data: {
                        userId: userIdNum,
                        tabUrl: String(tabUrl)
                    }
                });

                // Log event
                await prisma.eventLog.create({
                    data: {
                        userId: userIdNum,
                        eventType: 'tabswitched',
                        details: `Tab switched to: ${tabUrl}`
                    }
                });

                break;
            }

            default:
                return NextResponse.json(
                    { success: false, message: `Invalid event type: ${type}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
