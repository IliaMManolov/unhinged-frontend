import { NextResponse } from 'next/server';
import { deleteCarouselItemInStore, getPageData } from '@/app/lib/page-store';

interface DeleteCarouselNodeRequestBody {
  id: string;
}

export async function POST(request: Request) {
  try {
    const body: DeleteCarouselNodeRequestBody = await request.json();

    if (!body || typeof body.id !== 'string') {
      return NextResponse.json({ message: 'Invalid request body: id is required and must be a string.' }, { status: 400 });
    }

    const { id } = body;

    // Check if item exists before attempting delete
    const pageData = getPageData();
    const itemExists = pageData.carouselItems.some(item => item.id === id);
    if (!itemExists) {
      return NextResponse.json({ message: `Carousel item with id ${id} not found.` }, { status: 404 });
    }

    deleteCarouselItemInStore(id);
    return NextResponse.json({ message: `Carousel item with id ${id} deleted successfully` });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error deleting carousel item', error: (error as Error).message }, { status: 500 });
  }
} 