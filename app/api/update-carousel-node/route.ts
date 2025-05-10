import { NextResponse } from 'next/server';
import { updateCarouselItemInStore, CarouselItem, getPageData, TextNodeStateProps, ImageTextNodeStateProps } from '@/app/lib/page-store';

// This type guard is similar to the one in add-carousel-node, but also checks for an ID.
function isValidCarouselItem(body: any): body is CarouselItem {
  if (!body || typeof body.id !== 'string' || typeof body.type !== 'string') return false;
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

    if (!isValidCarouselItem(body)) {
      return NextResponse.json({ message: 'Invalid request body for carousel item update. Ensure id and type are present and properties match the type.' }, { status: 400 });
    }

    // Check if item exists before attempting update
    const pageData = getPageData();
    const itemExists = pageData.carouselItems.some(item => item.id === body.id);
    if (!itemExists) {
      return NextResponse.json({ message: `Carousel item with id ${body.id} not found.` }, { status: 404 });
    }

    // The updateCarouselItemInStore function expects (itemId: string, newProps: Partial<TextNodeStateProps> | Partial<ImageTextNodeStateProps>)
    // body.props will be the full set of props for that item type.
    // We cast body.props to the union of partials, which is safe here.
    updateCarouselItemInStore(body.id, body.props as Partial<TextNodeStateProps> | Partial<ImageTextNodeStateProps>);

    return NextResponse.json({ message: 'Carousel item updated successfully', item: body });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating carousel item', error: (error as Error).message }, { status: 500 });
  }
}