"use client";

import { cn } from "@/lib/utils";
import { months } from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils/data";
import { calendarRef } from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils/data";
import { Button } from "@shared/ui/button";
import {
  generateDaysInMonth,
  goNext,
  goPrev,
  goToday,
  handleDayChange,
  handleMonthChange,
  handleYearChange,
  setView,
} from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils/calendar-utils";
import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  GalleryVertical,
  Table,
  Tally3,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/ui/popover";

import { Input } from "@shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/tabs";
import { EventAddForm } from "./event-add-form";

interface CalendarNavProps {
  calendarRef: calendarRef;
  start: Date;
  end: Date;
  viewedDate: Date;
}

export default function CalendarNav({
  calendarRef,
  start,
  end,
  viewedDate,
}: CalendarNavProps) {
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const selectedMonth = viewedDate.getMonth() + 1;
  const selectedDay = viewedDate.getDate();
  const selectedYear = viewedDate.getFullYear();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = generateDaysInMonth(daysInMonth);

  const [daySelectOpen, setDaySelectOpen] = useState(false);
  const [monthSelectOpen, setMonthSelectOpen] = useState(false);

  return (
    <div className="flex flex-wrap min-w-full justify-center gap-10 px-10 ">
      <div className="flex flex-row space-x-1">
        {/* Navigate to previous date interval */}

        <Button
          variant="ghost"
          className="w-8"
          onClick={() => {
            goPrev(calendarRef);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Month Lookup */}

        <Popover open={monthSelectOpen} onOpenChange={setMonthSelectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="flex w-[105px] justify-between overflow-hidden p-2 text-xs font-semibold md:text-sm md:w-[120px]"
            >
              {selectedMonth
                ? months.find((month) => month.value === String(selectedMonth))
                  ?.label
                : "Select month..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search month..." />
              <CommandList>
                <CommandEmpty>No month found.</CommandEmpty>
                <CommandGroup>
                  {months.map((month) => (
                    <CommandItem
                      key={month.value}
                      value={month.value}
                      onSelect={(currentValue) => {
                        handleMonthChange(
                          calendarRef,
                          viewedDate,
                          currentValue
                        );
                        //   setValue(currentValue === selectedMonth ? "" : currentValue);
                        setMonthSelectOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          String(selectedMonth) === month.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {month.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Year Lookup */}

        <Input
          className="w-[75px] md:w-[85px] text-xs md:text-sm font-semibold"
          type="number"
          value={selectedYear}
          onChange={(value) => handleYearChange(calendarRef, viewedDate, value)}
        />

        {/* Navigate to next date interval */}

        <Button
          variant="ghost"
          className="w-8"
          onClick={() => {
            goNext(calendarRef);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {/* Button to go to current date */}

        <Button
          className="w-[90px] text-xs md:text-sm"
          variant="outline"
          onClick={() => {
            goToday(calendarRef);
          }}
        >
          {currentView === "timeGridDay"
            ? "Today"
            : currentView === "timeGridWeek"
              ? "This Week"
              : currentView === "dayGridMonth"
                ? "This Month"
                : null}
        </Button>
        {/* Add event button  */}

        <EventAddForm start={start} end={end} />
      </div>
    </div>
  );
}
