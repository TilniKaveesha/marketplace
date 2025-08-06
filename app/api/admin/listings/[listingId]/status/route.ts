import { NextRequest, NextResponse } from 'next/server'
import { updateListingStatus } from '@/lib/admin-actions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const { status } = await request.json()
    
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedListing = await updateListingStatus(params.listingId, status)
    
    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error('Failed to update listing status:', error)
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    )
  }
}
