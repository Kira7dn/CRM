"use client";

/**
 * Date Range Picker Component
 *
 * Allows users to select date ranges with preset options.
 */

import { useState } from "react";
import { Button } from "@/@shared/ui/button";
import { Calendar } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type DateRangePreset =
  | "today"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onPresetChange?: (preset: DateRangePreset) => void;
}

export function DateRangePicker({ value, onChange, onPresetChange }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("last30days");

  const presets: Array<{ label: string; value: DateRangePreset; getRange: () => DateRange }> = [
    {
      label: "Today",
      value: "today",
      getRange: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
    },
    {
      label: "Last 7 days",
      value: "last7days",
      getRange: () => ({
        startDate: subDays(new Date(), 6),
        endDate: new Date(),
      }),
    },
    {
      label: "Last 30 days",
      value: "last30days",
      getRange: () => ({
        startDate: subDays(new Date(), 29),
        endDate: new Date(),
      }),
    },
    {
      label: "This month",
      value: "thisMonth",
      getRange: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    {
      label: "Last month",
      value: "lastMonth",
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
      },
    },
  ];

  const handlePresetClick = (preset: (typeof presets)[0]) => {
    const range = preset.getRange();
    setSelectedPreset(preset.value);
    onChange(range);
    onPresetChange?.(preset.value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="w-5 h-5 text-gray-500" />
      {presets.map((preset) => (
        <Button
          key={preset.value}
          variant={selectedPreset === preset.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset)}
        >
          {preset.label}
        </Button>
      ))}
      <div className="ml-auto text-sm text-gray-600">
        {format(value.startDate, "MMM dd, yyyy")} - {format(value.endDate, "MMM dd, yyyy")}
      </div>
    </div>
  );
}
