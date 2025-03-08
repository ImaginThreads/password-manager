/* eslint-disable @typescript-eslint/no-explicit-any */
// import { encryptCard } from './../../../lib/utils';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import crypto from "crypto";
import mongoose from "mongoose";
import password from "@/lib/models/password";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 32 character string");
}

const encryptPassword = (text: string) => {
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
    const { website, username, password, phone, QuestionName } = body;

    if (!website || !username || !password || !phone || !QuestionName) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const encryptedPasswordNumber = encryptPassword(password);
    const encryptedPhone = encryptPassword(phone); // Corrected function usage

    // Ensure PasswordModel is the correct Mongoose model
    const newPassword = await password.create({
      website,
      username,
      password: encryptedPasswordNumber,
      phone: encryptedPhone,
      QuestionName,
    });

    return NextResponse.json({
      success: true,
      message: "Password Added Successfully",
      password: {
        _id: newPassword._id,
        passwordNumber: `**** **** **** ${password.slice(-4)}`,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/passwords:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add password" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const {searchParams} = new URL(req.url);
        const websiteId = searchParams.get ('websiteId');
        if(!websiteId){
            return NextResponse.json({ success: false, message: "Website ID is required" }, { status: 400 });
        }
        try {
            const passwords = await password.find({website: websiteId})
            return NextResponse.json({success: true, passwords})
        } catch (error) {
            return NextResponse.json({ success: false, message: "Failed to get passwords" }, { status:500}
        )}
    } catch (error) {
        
    }
}
