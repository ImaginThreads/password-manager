"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CardDialog } from "@/components/cardDialog";
import { maskCardNumber } from "@/lib/utils";

interface SavedCard {
  _id: string;
  cardNumber: string;
  expiryDate: string;
}

export function YourCards() {
  const { user } = useUser();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      if (user) {
        try {
          const response = await fetch(`/api/cards?userId=${user.id}`);
          const data = await response.json();
          if (data.success) {
            setCards(data.cards);
          }
        } catch (error) {
          console.error("Error fetching cards:", error);
        }
      }
    }
    fetchCards();
  }, [user]);

  const handleCardClick = (card: SavedCard) => {
    setSelectedCard(card);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Cards</CardTitle>
          <CardDescription>Manage your saved credit cards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Number</TableHead>
                <TableHead>Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow
                  key={card._id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleCardClick(card)}
                >
                  <TableCell>{maskCardNumber(card.cardNumber)}</TableCell>
                  <TableCell>{card.expiryDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        card={selectedCard} onCardUpdated={function (): void {
          throw new Error("Function not implemented.");
        } }      />
    </>
  );
}
