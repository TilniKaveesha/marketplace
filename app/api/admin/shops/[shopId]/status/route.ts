import { NextRequest, NextResponse } from 'next/server'
import { updateShopStatus } from '@/lib/admin-actions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { status } = await request.json()
    
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedShop = await updateShopStatus(params.shopId, status)
    
    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Failed to update shop status:', error)
    return NextResponse.json(
      { error: 'Failed to update shop status' },
      { status: 500 }
    )
  }
}
