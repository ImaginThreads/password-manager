"use client";

// import { currentUser } from "@clerk/nextjs/server";
// import { Metadata } from "next";
import { AddCard } from "./components/AddCard";
import { AddPasswords } from "./components/AddPasswords";
import { YourCards } from "./components/YourCards";
import { YourPasswords } from "./components/YourPasswords";

// export const metadata: Metadata = {
//   title: "NoPass - Home",
//   description: "Manage your passwords securely and easily",
//   keywords: ["password manager", "password", "security"],
// }
export default function Home() {
  // const user = await currentUser()
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section>
            <h1 className="text-2xl font-bold mb-4">Add a Credit Card</h1>
            <AddCard />
          </section>
          <section>
            <h1 className="text-2xl font-bold mb-4">Your Cards</h1>
            <YourCards />
          </section>
        </div>
        <div className="space-y-8">
          <section>
            <h1 className="text-2xl font-bold mb-4">Add a Password</h1>
            <AddPasswords />
          </section>
          <section>
            <h1 className="text-2xl font-bold mb-4">Your Passwords</h1>
            <YourPasswords />
          </section>
        </div>
      </div>
    </div>
  );
}
