import { NextResponse } from 'next/server';
import { updateRadarDataInStore, PageDataStore } from '@/app/lib/page-store';
import { v4 as uuidv4 } from 'uuid'; // Though not used in this specific file, good for consistency if other POSTs add it

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data) || !data.every(item => typeof item === 'number')) {
      return NextResponse.json({ message: 'Invalid radar data format. Expected array of numbers.' }, { status: 400 });
    }

    const updatedStore: PageDataStore = updateRadarDataInStore(data as number[]);
    return NextResponse.json({ message: 'Radar data updated successfully', data: updatedStore.radarData });

  } catch (error) {
    console.error("Error updating radar data:", error);
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating radar data' }, { status: 500 });
  }
} 