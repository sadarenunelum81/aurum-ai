import { NextResponse } from 'next/server';
import { getAdminUser, getAllUsers } from '@/lib/auth';
import { getAutoBloggerConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to test cron job configuration
 * Access: /api/cron/diagnostics?secret=YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        checks: {}
    };

    try {
        // 1. Check Authorization
        const { searchParams } = new URL(request.url);
        const urlSecret = searchParams.get('secret');
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        diagnostics.checks.cronSecretSet = !!cronSecret;
        diagnostics.checks.urlSecretProvided = !!urlSecret;
        diagnostics.checks.authHeaderProvided = !!authHeader;

        if (!cronSecret) {
            diagnostics.checks.authorization = 'FAIL: CRON_SECRET not set in environment';
        } else if (urlSecret === cronSecret || authHeader === `Bearer ${cronSecret}`) {
            diagnostics.checks.authorization = 'PASS';
        } else {
            diagnostics.checks.authorization = 'FAIL: Invalid secret';
            return NextResponse.json(diagnostics, { status: 401 });
        }

        // 2. Check GEMINI_API_KEY
        diagnostics.checks.geminiApiKeySet = !!process.env.GEMINI_API_KEY;
        if (!process.env.GEMINI_API_KEY) {
            diagnostics.checks.geminiApiKey = 'FAIL: GEMINI_API_KEY not set';
        } else {
            diagnostics.checks.geminiApiKey = 'PASS';
        }

        // 3. Check Firebase Configuration
        try {
            const allUsers = await getAllUsers();
            diagnostics.checks.firebaseConnection = 'PASS';
            diagnostics.checks.totalUsers = allUsers.length;
        } catch (error: any) {
            diagnostics.checks.firebaseConnection = `FAIL: ${error.message}`;
        }

        // 4. Check Admin User
        try {
            const adminUser = await getAdminUser();
            if (adminUser) {
                diagnostics.checks.adminUser = 'PASS';
                diagnostics.checks.adminUserId = adminUser.id;
                diagnostics.checks.adminEmail = (adminUser as any).email;
            } else {
                diagnostics.checks.adminUser = 'FAIL: No admin user found';
            }
        } catch (error: any) {
            diagnostics.checks.adminUser = `FAIL: ${error.message}`;
        }

        // 5. Check Auto Blogger Config
        try {
            const config = await getAutoBloggerConfig();
            if (config) {
                diagnostics.checks.autoBloggerConfig = 'PASS';
                diagnostics.checks.configDetails = {
                    category: config.category,
                    keywordsCount: config.keywords?.length || 0,
                    titleMode: config.titleMode,
                    publishAction: config.publishAction,
                    language: config.language
                };
            } else {
                diagnostics.checks.autoBloggerConfig = 'FAIL: Config not found';
            }
        } catch (error: any) {
            diagnostics.checks.autoBloggerConfig = `FAIL: ${error.message}`;
        }

        // Summary
        const failures = Object.entries(diagnostics.checks)
            .filter(([key, value]) => typeof value === 'string' && value.includes('FAIL'))
            .map(([key]) => key);

        diagnostics.summary = {
            status: failures.length === 0 ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED',
            failedChecks: failures,
            readyForCron: failures.length === 0
        };

        return NextResponse.json(diagnostics, { 
            status: failures.length === 0 ? 200 : 500 
        });

    } catch (error: any) {
        diagnostics.criticalError = {
            message: error.message,
            stack: error.stack,
            name: error.name
        };
        return NextResponse.json(diagnostics, { status: 500 });
    }
}
