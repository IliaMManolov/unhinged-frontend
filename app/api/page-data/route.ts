import { NextResponse } from 'next/server';
import { getPageData, PageDataStore } from '@/app/lib/page-store'; // Adjust path if lib is elsewhere relative to app

export async function GET(request: Request) {
  try {
    const data: PageDataStore = getPageData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching page data:", error);
    return NextResponse.json({ message: 'Error fetching page data' }, { status: 500 });
  }
} 