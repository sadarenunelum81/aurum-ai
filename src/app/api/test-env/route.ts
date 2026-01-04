import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        hasCronSecret: !!process.env.CRON_SECRET,
        cronSecretLength: process.env.CRON_SECRET?.length || 0,
        cronSecretFirst10: process.env.CRON_SECRET?.substring(0, 10) || 'NOT_SET',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('CRON') || k.includes('SECRET')),
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
    });
}
