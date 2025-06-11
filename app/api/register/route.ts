import { AUTH_COOKIE_NAME } from "@/constant/server";
import { APP_CONFIG } from "@/lib/app-config";
import { createAdminClient } from "@/lib/appwrite";
import { signupSchema } from "@/validation/auth.validation";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ID, Permission, Role } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const { email, name, password, shopName, phone, idNumber } = await signupSchema.parse(body);

    // Create Appwrite admin client
    const { account, databases } = await createAdminClient();

    // Create user
    const user = await account.create(ID.unique(), email, password, name);

    // Set preferences (optional)
    /*await account.updatePrefs({
      phone,
      idNumber,
    });*/

    // Create session for user
    const session = await account.createEmailPasswordSession(email, password);

    // Create shop document
    const shop = await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      ID.unique(),
      {
        ShopName: shopName,
        userId: user.$id,
      }
    );

    // Save phone and ID number to a separate collection with user-specific permissions
    await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.USER_ID,
      ID.unique(),
      {
        userId: user.$id,
        Phone:phone,
        IdNumber:idNumber,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    // Set auth cookie
    cookies().set(AUTH_COOKIE_NAME, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      message: "User created successfully",
      userId: user.$id,
      shopId: shop.$id,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
