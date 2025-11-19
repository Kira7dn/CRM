"use client";

import type { MessageCampaign } from "@/core/domain/customer-care/message-campaign";
import { Badge } from "@shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/ui/table";
import { Button } from "@shared/ui/button";
import { Play, Pause, Trash2 } from "lucide-react";

interface CampaignListProps {
  campaigns: MessageCampaign[];
}

const statusColors = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  running: "bg-green-500",
  paused: "bg-yellow-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
};

const typeLabels = {
  one_time: "One-Time",
  recurring: "Recurring",
  triggered: "Triggered",
};

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No campaigns found. Create your first campaign to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Delivery Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{campaign.name}</div>
                  {campaign.description && (
                    <div className="text-xs text-muted-foreground">
                      {campaign.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {typeLabels[campaign.type]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{campaign.platform}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[campaign.status]}>
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>
                {campaign.statistics.totalRecipients.toLocaleString()}
              </TableCell>
              <TableCell>
                {campaign.statistics.sent.toLocaleString()}
              </TableCell>
              <TableCell>
                {campaign.statistics.deliveryRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {campaign.status === "scheduled" && (
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {campaign.status === "running" && (
                    <Button variant="ghost" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
