
import { createSessionClient } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { databases } = await createSessionClient();
  
  try {
    // 1. Update order status (your existing logic)
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ORDERS_COLLECTION_ID!,
      params.id,
      { 
        status: 'paid',
        paidAt: new Date().toISOString() 
      }
    );

    // 2. Your existing notification code remains unchanged
    // ...

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}