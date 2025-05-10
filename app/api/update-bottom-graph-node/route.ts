import { NextResponse } from 'next/server';
import { updateBottomGraphNodeInStore, GraphNodeData } from '@/app/lib/page-store';

export async function POST(request: Request) {
  try {
    const body: GraphNodeData = await request.json();
    if (!body || typeof body.imageUrl !== 'string' || typeof body.title !== 'string') {
      return NextResponse.json({ message: 'Invalid request body: imageUrl and title are required and must be strings.' }, { status: 400 });
    }
    updateBottomGraphNodeInStore(body);
    return NextResponse.json({ message: 'Bottom graph node data updated successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating bottom graph node data', error: (error as Error).message }, { status: 500 });
  }
} 