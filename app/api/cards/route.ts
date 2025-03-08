import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Card from "@/lib/models/card";
import crypto from "crypto";
import mongoose from "mongoose";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("Invalid ENCRYPTION_KEY. It must be a 32-character string.");
}

const encryptCard = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, cardNumber, expiryDate, cvv } = body;

    if (!userId || !cardNumber || !expiryDate || !cvv) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const encryptedCardNumber = encryptCard(cardNumber);
    const encryptedCVV = encryptCard(cvv);

    const newCard = await Card.create({
      userId,
      cardNumber: encryptedCardNumber,
      expiryDate,
      cvv: encryptedCVV,
    });

    return NextResponse.json({
      success: true,
      message: "Card added successfully",
      card: {
        _id: newCard._id,
        expiryDate: newCard.expiryDate,
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/cards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add card" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const cards = await Card.find({ userId })
      .select("cardNumber expiryDate createdAt")
      .sort({ createdAt: -1 });

    const processedCards = cards.map((card) => ({
      _id: card._id,
      cardNumber: `**** **** **** ${card.cardNumber.split(":")[1].slice(-4)}`,
      expiryDate: card.expiryDate,
      createdAt: card.createdAt,
    }));

    return NextResponse.json({ success: true, cards: processedCards });
  } catch (error) {
    console.error("Error in GET /api/cards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    // Get both cardId and userId from the URL parameters
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("cardId");
    const userId = searchParams.get("userId");

    console.log(
      `Received delete request - cardId: ${cardId}, userId: ${userId}`
    );

    // Validate both parameters are present
    if (!cardId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Card ID and User ID are required",
          receivedParams: { cardId, userId }, // Helpful for debugging
        },
        { status: 400 }
      );
    }

    // Validate cardId format
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Card ID" },
        { status: 400 }
      );
    }

    // Find and delete the card
    const deletedCard = await Card.findOneAndDelete({
      _id: cardId,
      userId: userId,
    });

    if (!deletedCard) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/cards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete card" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { cardId, userId, expiryDate } = body;

    if (!cardId || !userId || !expiryDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedCard = await Card.findOneAndUpdate(
      { _id: cardId, userId },
      { expiryDate },
      { new: true }
    ).select("cardNumber expiryDate");

    if (!updatedCard) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Card updated successfully",
      card: {
        _id: updatedCard._id,
        expiryDate: updatedCard.expiryDate,
        cardNumber: `**** **** **** ${updatedCard.cardNumber
          .split(":")[1]
          .slice(-4)}`,
      },
    });
  } catch (error) {
    console.error("Error in PATCH /api/cards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update card" },
      { status: 500 }
    );
  }
}
