import { NextResponse } from 'next/server';

type HealthResponse = {
  status: 'ok';
  timestamp: string;
  version: string;
};

export async function GET() {
  const body: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '0.1.0',
  };

  return NextResponse.json(body, { status: 200 });
}
