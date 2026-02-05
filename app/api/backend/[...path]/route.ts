import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ??
  'https://admin.sunyaiashindi.com/api/v1/mentorship-portal';

async function forward(request: Request, pathParts: string[]) {
  const upstreamUrl = `${BACKEND_BASE_URL}/${pathParts.join('/')}`;

  // Copy only safe/needed headers.
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');
  if (contentType) headers.set('content-type', contentType);
  if (authorization) headers.set('authorization', authorization);

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const upstreamRes = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    // Don't cache auth responses.
    cache: 'no-store',
  });

  const resContentType = upstreamRes.headers.get('content-type') ?? '';
  const resBody = await upstreamRes.text();

  return new NextResponse(resBody, {
    status: upstreamRes.status,
    headers: {
      'content-type': resContentType || 'application/json',
    },
  });
}

export async function GET(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function POST(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function PUT(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function DELETE(request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}
