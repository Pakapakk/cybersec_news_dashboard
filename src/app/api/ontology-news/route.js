import { NextResponse } from 'next/server';
import {
  getOntologyStatistics,
  getAllNewsArticles,
} from '@/lib/getOntologyStats';

export async function GET() {
  try {
    const statistics = await getOntologyStatistics();
    const allNews = await getAllNewsArticles();

    return NextResponse.json({ statistics, allNews });
  } catch (error) {
    console.error('Failed to fetch ontology statistics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
