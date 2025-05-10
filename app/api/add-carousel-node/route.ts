import { NextResponse } from 'next/server';
import { addCarouselItemInStore, CarouselItem } from '@/app/lib/page-store';
import { v4 as uuidv4 } from 'uuid';

function isValidCarouselItemData(body: any): body is CarouselItem {
  if (!body || typeof body.type !== 'string') return false;
  if (body.type === 'textNode') {
    return typeof body.inputText === 'string' && 
           typeof body.responseText === 'string' &&
           (body.confidenceScore === undefined || typeof body.confidenceScore === 'number' || body.confidenceScore === null) &&
           (body.isLoadingResponse === undefined || typeof body.isLoadingResponse === 'boolean') &&
           (body.isCalculatingConfidence === undefined || typeof body.isCalculatingConfidence === 'boolean');
  } else if (body.type === 'imageTextNode') {
    return typeof body.promptText === 'string' &&
           typeof body.imageUrl === 'string' &&
           typeof body.imageAlt === 'string' &&
           typeof body.responseText === 'string' &&
           (body.isLoadingResponse === undefined || typeof body.isLoadingResponse === 'boolean');
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidCarouselItemData(body)) {
      return NextResponse.json({ message: 'Invalid request body for carousel item.' }, { status: 400 });
    }

    const newItem: CarouselItem = {
      ...body,
      id: uuidv4(), // Assign a new UUID
    };

    addCarouselItemInStore(newItem);
    return NextResponse.json({ message: 'Carousel item added successfully', item: newItem });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error adding carousel item', error: (error as Error).message }, { status: 500 });
  }
} 