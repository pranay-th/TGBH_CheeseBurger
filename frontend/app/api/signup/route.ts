import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {prisma} from '../../../prisma/client';
// Simple in-memory rate limiter to prevent spam account creation
const signupAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_SIGNUP_ATTEMPTS = 3;
const SIGNUP_LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    // Create response headers with explicit Content-Type
    const headers = {
      'Content-Type': 'application/json'
    };

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check rate limiting for signups
    if (signupAttempts.has(ip)) {
      const attempt = signupAttempts.get(ip)!;
      const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
      
      // Reset attempts after lockout period
      if (timeSinceLastAttempt > SIGNUP_LOCKOUT_TIME) {
        signupAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
      } 
      // If still in lockout period and max attempts reached
      else if (attempt.count >= MAX_SIGNUP_ATTEMPTS && timeSinceLastAttempt < SIGNUP_LOCKOUT_TIME) {
        const minutesLeft = Math.ceil((SIGNUP_LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            message: `Account creation limit reached. Try again in ${minutesLeft} minutes.` 
          }),
          { status: 429, headers }
        );
      } 
      // Update attempt counter
      else {
        attempt.count += 1;
        attempt.lastAttempt = Date.now();
        signupAttempts.set(ip, attempt);
      }
    } else {
      // First attempt
      signupAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Invalid JSON in request body' }), 
        { status: 400, headers }
      );
    }

    const { username, password } = requestBody;

    // Enhanced input validation
    if (!username || typeof username !== 'string') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Username is required' }),
        { status: 400, headers }
      );
    }
    
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Username must be at least 3 characters long' }),
        { status: 400, headers }
      );
    }
    
    // Check for disallowed characters in username
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Username can only contain letters, numbers, and underscores' }),
        { status: 400, headers }
      );
    }

    if (!password || typeof password !== 'string') {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Password is required' }),
        { status: 400, headers }
      );
    }
    
    if (password.length < 8) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Password must be at least 8 characters long' }),
        { status: 400, headers }
      );
    }
    
    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Password must include at least one uppercase letter, one lowercase letter, and one number' 
        }),
        { status: 400, headers }
      );
    }

    try {
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: trimmedUsername }
      });

      if (existingUser) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Username already exists' }),
          { status: 400, headers }
        );
      }

      // Hash the password with strong settings
      const hashedPassword = await bcrypt.hash(password, 12); // Increased cost factor for better security

      // Create new user
      const user = await prisma.user.create({
        data: {
          username: trimmedUsername,
          password: hashedPassword
        }
      });
      
      // Success! Reset attempt counter
      signupAttempts.delete(ip);
      
      // Create initial event log for signup
      await prisma.eventLog.create({
        data: {
          userId: user.id,
          eventType: 'SIGNUP',
          details: `User account created from IP: ${ip}`
        }
      });

      // Create the response object with explicit headers
      return new NextResponse(
        JSON.stringify({
          success: true,
          userId: user.id,
          username: user.username, // Include username in the response
          message: 'User created successfully'
        }),
        { status: 201, headers } // 201 Created is more appropriate for resource creation
      );
    } catch (dbError) {
      console.error('Database error during signup:', dbError);
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Database error during signup' }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    // Return JSON even for unexpected errors
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Internal server error during signup' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}