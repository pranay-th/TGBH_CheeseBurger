import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Sample questions based on the provided questions.ts
const codingQuestions = [
    {
        id: '1',
        title: 'Two Sum',
        difficulty: 'Easy',
        question: `Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
        language: 'javascript',
        initialCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    
}`,
        testCases: `Test Cases:
1. Input: nums = [2,7,11,15], target = 9
   Output: [0,1]
2. Input: nums = [3,2,4], target = 6
   Output: [1,2]`
    },
    {
        id: '2',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        question: `Given a string s, return true if it is a palindrome, or false otherwise.

A string is a palindrome when it reads the same backward as forward.
You should ignore cases and non-alphanumeric characters.

Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.`,
        language: 'javascript',
        initialCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Write your solution here
    
}`,
        testCases: `Test Cases:
1. Input: s = "A man, a plan, a canal: Panama"
   Output: true
2. Input: s = "race a car"
   Output: false`
    },
    {
        id: '3',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        question: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.`,
        language: 'javascript',
        initialCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your solution here
    
}`,
        testCases: `Test Cases:
1. Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
   Output: 6
2. Input: nums = [1]
   Output: 1`
    }
];


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

        return NextResponse.json({
            success: true,
            data: {
                questions: codingQuestions,
                timeLimit: 7200, // 2 hours
                startTime: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching exam:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch exam' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

function calculateScore(answers: any[]): number {
    // Implement your scoring logic here
    return 0; // Placeholder implementation
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { action, answers, timeSpent, questionId, answer } = await request.json();

        switch (action) {
            case 'submitCode':
                // Handle code submission (existing logic)
                await prisma.eventLog.create({
                    data: {
                        userId: parseInt(userId),
                        eventType: 'CODE_SUBMISSION',
                        details: JSON.stringify({
                            answers,
                            timeSpent,
                            submittedAt: new Date().toISOString(),
                        }),
                    },
                });

                const score = calculateScore(answers);

                const submission = await prisma.examSubmission.create({
                    data: {
                        userId: parseInt(userId),
                        score: score,
                        timeSpent: timeSpent,
                        answers: JSON.stringify(answers),
                    },
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Code submitted successfully',
                    },
                });

            case 'submitAnswer':
                // Handle question submission (new logic)
                await prisma.examSubmission.upsert({
                    where: { userId: parseInt(userId) },
                    create: {
                        userId: parseInt(userId),
                        answers: { [questionId]: answer },
                        timeSpent: timeSpent,
                        score: 0, // You can calculate the score later
                    },
                    update: {
                        answers: { [questionId]: answer },
                        timeSpent: timeSpent,
                    },
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        message: 'Answer submitted successfully',
                    },
                });

            default:
                return NextResponse.json(
                    { success: false, message: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { questionId, code } = await request.json();

        // Log the code progress
        await prisma.eventLog.create({
            data: {
                userId: parseInt(userId),
                eventType: 'CODE_PROGRESS',
                details: JSON.stringify({
                    questionId,
                    codeLength: code.length,
                    savedAt: new Date().toISOString()
                })
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Progress saved'
        });
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to save progress' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}