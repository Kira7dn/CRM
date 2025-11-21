"use client";

import { useState } from "react";
import { Button } from "@/@shared/ui/button";
import { Plus } from "lucide-react";
import { CreateTicketDialog } from "./CreateTicketDialog";

export function CreateTicketButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Ticket
      </Button>

      <CreateTicketDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
