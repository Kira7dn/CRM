import { TicketList } from "./_components/TicketList";
import { CreateTicketButton } from "./_components/CreateTicketButton";
import { getTicketsUseCase } from "@/app/api/customers/tickets/depends";
import { Ticket } from "lucide-react";

export default async function TicketsPage() {
  // Fetch tickets from server
  const useCase = await getTicketsUseCase();
  const result = await useCase.execute({});

  // Serialize tickets to plain objects (convert ObjectId, Date, etc.)
  const tickets = JSON.parse(JSON.stringify(result.tickets));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Ticket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Support Tickets
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage customer support requests and issues
              </p>
            </div>
          </div>
          <CreateTicketButton />
        </div>

        {/* Ticket List */}
        <TicketList initialTickets={tickets} />
      </div>
    </div>
  );
}
