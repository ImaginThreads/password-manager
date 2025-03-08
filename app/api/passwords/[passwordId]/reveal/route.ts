/* eslint-disable @typescript-eslint/no-unused-vars */
import { maskPasswordNumber } from './../../../../../lib/utils';
import { decryptCard } from '@/lib/utils';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Card from "@/lib/models/card";
import { decryptPassword } from "@/lib/utils";
import mongoose from "mongoose";
import password from "@/lib/models/password";

export async function GET(
    req: NextRequest,
    context: {params: {websiteId: string}}
){
    try {
        await connectDB();
        const websiteId = context.params.websiteId;
        console.log("Revealing password", websiteId)
        if(!websiteId || !mongoose.Types.ObjectId.isValid(websiteId)){
            return NextResponse.json(
                {success: false, message: "Invalid website id"},
                {status: 400}
            )
        }
         
        const Password = await password.findById(websiteId);

        if(!Password){
            return NextResponse.json(
                {success: false, message: "Password not found"},
                {status: 404}
            )
        }

        const decryptedPasswordNumber = decryptPassword(Password.password)
        return NextResponse.json({
            success: true,
            passwordNumber: decryptedPasswordNumber
        })
    } catch (error) {
        console.error("Error revealing card", error);
        return NextResponse.json(
            { success: false, message: "Error revealing card"},
            { status: 500 }
        )
    }
}
