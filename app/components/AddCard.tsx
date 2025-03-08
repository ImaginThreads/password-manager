/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  cardNumber: z
    .string()
    .min(13, { message: "Card number must be at least 13 digits" })
    .max(19, { message: "Card number cannot exceed 19 digits" })
    .regex(/^[\d\s-]+$/, {
      message: "Card number can only contain digits, spaces, or hyphens",
    })
    .transform((val) => val.replace(/[\s-]/g, "")),

  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
      message: "Expiry date must be in MM/YY format",
    })
    .refine(
      (val) => {
        const [month, yearStr] = val.split("/");
        const year = parseInt(yearStr);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const inputMonth = parseInt(month);
        const inputYear = parseInt(yearStr);

        if (inputYear > currentYear) return true;
        if (inputYear === currentYear && inputMonth >= currentMonth)
          return true;
        return false;
      },
      {
        message: "Card has expired",
      }
    ),

  cvv: z
    .string()
    .min(3, { message: "CVV must be 3 or 4 digits" })
    .max(4, { message: "CVV must not be more than 4 digits" })
    .regex(/^\d+$/, { message: "CVV must contain only digits" }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddCard() {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast.error("You must be logged in to add a card");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...values,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Card added successfully");
        form.reset();
      } else {
        toast.error(data.message || "Failed to add card");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error submitting card:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add New Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="XXXX XXXX XXXX XXXX"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your 16-digit card number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MM/YY"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter expiry date in MM/YY format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="XXX"
                      maxLength={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the 3 or 4 digit security code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding Card..." : "Add Card"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
