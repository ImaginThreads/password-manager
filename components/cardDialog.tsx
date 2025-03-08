/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { maskCardNumber } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface CardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: {
    _id: string;
    cardNumber: string;
    expiryDate: string;
  } | null;
  onCardUpdated: () => void;
}

export function CardDialog({
  isOpen,
  onClose,
  card,
  onCardUpdated,
}: CardDialogProps) {
  const { user } = useUser();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedExpiry, setEditedExpiry] = useState("");
  const [fullCardNumber, setFullCardNumber] = useState<string | null>(null);

  if (!card) return null;

  const handleShowCardNumber = async () => {
    if (showCardNumber) {
      setShowCardNumber(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cards/${card._id}/reveal`, {
        method: "GET",
      });
      const data = await response.json();

      if (data.success) {
        setFullCardNumber(data.cardNumber);
        setShowCardNumber(true);
      } else {
        toast.error("Failed to reveal card number");
      }
    } catch (error) {
      toast.error("Failed to reveal card number");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/cards?cardId=${card._id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Card deleted successfully");
        onCardUpdated();
        onClose();
      } else {
        toast.error(data.message || "Failed to delete card");
      }
    } catch (error) {
      toast.error("Failed to delete card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditedExpiry(card.expiryDate);
      return;
    }

    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: card._id,
          userId: user.id,
          expiryDate: editedExpiry,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Card updated successfully");
        onCardUpdated();
        setIsEditing(false);
      } else {
        toast.error(data.message || "Failed to update card");
      }
    } catch (error) {
      toast.error("Failed to update card");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowCardNumber(false);
    setFullCardNumber(null);
    setIsEditing(false);
    setEditedExpiry("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>
            Your card information is securely stored
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Card Number</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShowCardNumber}
                disabled={isLoading}
              >
                {showCardNumber ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-2xl tracking-wider font-mono">
              {showCardNumber && fullCardNumber
                ? fullCardNumber
                : maskCardNumber(card.cardNumber)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Expiry Date</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            {isEditing ? (
              <Input
                value={editedExpiry}
                onChange={(e) => setEditedExpiry(e.target.value)}
                placeholder="MM/YY"
                className="text-xl font-mono"
              />
            ) : (
              <p className="text-xl font-mono">{card.expiryDate}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            {isEditing && (
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            {isEditing && (
              <Button onClick={handleEdit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
