// actions.ts
"use server";
import { clerkClient } from "@clerk/clerk-sdk-node";

interface Password {
  cardNo: string;
  expiry: string;
  cvv: string;
}

interface PrivateMetadata {
  passwords?: Password[];
}

interface CardResponse {
  success: boolean;
  message: string;
}

export async function AddCardServer(
  cardNo: string,
  expiry: string,
  cvv: string,
  userId: string
): Promise<CardResponse> {
  try {
    const user = await clerkClient.users.getUser(userId);

    const currentMetadata = user.privateMetadata as PrivateMetadata;
    const existingPasswords: Password[] = currentMetadata.passwords || [];

    const updatedPasswords = [...existingPasswords, { cardNo, expiry, cvv }];

    await clerkClient.users.updateUser(userId, {
      privateMetadata: {
        ...currentMetadata,
        passwords: updatedPasswords,
      },
    });

    return {
      success: true,
      message: "Card added successfully",
    };
  } catch (error) {
    console.error("Error adding card:", error);
    return {
      success: false,
      message: "Failed to add card",
    };
  }
}

export async function GetUserCards(userId: string): Promise<Password[]> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata as PrivateMetadata;
    return metadata.passwords || [];
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
}
