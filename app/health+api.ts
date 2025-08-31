export async function GET(): Promise<Response> {
  return Response.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'AI Personal Training App'
    },
    { status: 200 }
  );
}