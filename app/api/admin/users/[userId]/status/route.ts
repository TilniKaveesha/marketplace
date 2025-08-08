import { NextRequest, NextResponse } from "next/server";
import { updateUserStatus } from "@/lib/admin-actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { status } = await request.json();
    const { userId } = params;

    if (!status || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserStatus(userId, status);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
