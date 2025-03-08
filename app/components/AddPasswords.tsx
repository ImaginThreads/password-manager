// AddPassword.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AddPasswords() {
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/passwords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website, username, password, phone, question }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage("Password added successfully");
      setWebsite("");
      setUsername("");
      setPassword("");
      setPhone("");
      setQuestion("");
    } else {
      setMessage("Error adding password: " + data.message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Password</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <p className="text-center text-sm text-red-500">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Question Name</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit">
            Add Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// route.ts (POST and GET handlers for passwords)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import crypto from "crypto";
import mongoose from "mongoose";
import PasswordModel from "@/lib/models/password";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 32-character string");
}

const keyBuffer = Buffer.from(ENCRYPTION_KEY, "utf-8");

const encryptPassword = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

const decryptPassword = (text: string) => {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = Buffer.from(parts.join(""), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedText, undefined, "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { website, username, password, phone, question } = body;

    if (!website || !username || !password || !phone || !question) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const encryptedPassword = encryptPassword(password);
    const encryptedPhone = encryptPassword(phone);

    const newPassword = await PasswordModel.create({
      website,
      username,
      password: encryptedPassword,
      phone: encryptedPhone,
      question,
    });

    return NextResponse.json({
      success: true,
      message: "Password Added Successfully",
      passwordId: newPassword._id,
    });
  } catch (error) {
    console.error("Error adding password:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add password" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = context.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid password ID" },
        { status: 400 }
      );
    }

    const passwordRecord = await PasswordModel.findById(id);
    if (!passwordRecord) {
      return NextResponse.json(
        { success: false, message: "Password not found" },
        { status: 404 }
      );
    }

    const decryptedPassword = decryptPassword(passwordRecord.password);
    return NextResponse.json({ success: true, password: decryptedPassword });
  } catch (error) {
    console.error("Error fetching password:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching password" },
      { status: 500 }
    );
  }
}
