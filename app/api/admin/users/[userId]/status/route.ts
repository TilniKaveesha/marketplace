import { NextRequest, NextResponse } from 'next/server'
import { updateUserStatus } from '@/lib/admin-actions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { status } = await request.json()
    
    if (!['active', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedUser = await updateUserStatus(params.userId, status)
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
