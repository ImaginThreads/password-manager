import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Card from "@/lib/models/card";
import { decryptCard } from "@/lib/utils";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: { cardId: string } }
) {
  try {
    await connectDB();

    const cardId = context.params.cardId;
    console.log("Revealing card:", cardId);

    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Card ID" },
        { status: 400 }
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 }
      );
    }

    const decryptedCardNumber = await decryptCard(card.cardNumber);

    return NextResponse.json({
      success: true,
      cardNumber: decryptedCardNumber,
    });
  } catch (error) {
    console.error("Error revealing card:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reveal card number" },
      { status: 500 }
    );
  }
}
