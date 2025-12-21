"use client";

import { cn } from "@/lib/utils";
import { months } from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils/data";
import { calendarRef } from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils/data";
import { Button } from "@shared/ui/button";
import {
  goNext,
  goPrev,
  goToday,
  handleMonthChange,
  handleYearChange,
} from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils/calendar-utils";
import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Save,
  Sparkles,
  Undo2,
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
import { usePostStore } from "../../_store/usePostStore";
import { useGenerateSchedule } from "../../_hooks/useGenerateSchedule";
import { useRouter } from "next/navigation";
import PostFilter from "../PostFilter";


interface CalendarNavProps {
  calendarRef: calendarRef;
  viewedDate: Date;
}

export default function CalendarNav({
  calendarRef,
  viewedDate,
}: CalendarNavProps) {
  const { previewPosts, isGeneratingSchedule, isSavingSchedule } = usePostStore();
  const { generateSchedule, saveSchedule, undoSchedule } = useGenerateSchedule();
  const router = useRouter();

  const selectedMonth = viewedDate.getMonth() + 1;
  const selectedYear = viewedDate.getFullYear();

  const [monthSelectOpen, setMonthSelectOpen] = useState(false);

  const isCurrentMonth = () => {
    const today = new Date();
    return (
      viewedDate.getMonth() === today.getMonth() &&
      viewedDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left Section: Date Navigation */}
          <div className="flex items-center gap-2 w-full lg:w-full justify-between lg:justify-between">
            <div className="flex items-center gap-2">
              <PostFilter />
            </div>
            <div className="flex items-center gap-1 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background"
                onClick={() => goPrev(calendarRef)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={monthSelectOpen} onOpenChange={setMonthSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="h-8 px-3 font-semibold hover:bg-background min-w-[100px] justify-between"
                  >
                    {months.find((m) => m.value === String(selectedMonth))?.label}
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search month..." />
                    <CommandList>
                      <CommandEmpty>No month found.</CommandEmpty>
                      <CommandGroup>
                        {months.map((month) => (
                          <CommandItem
                            key={month.value}
                            value={month.value}
                            onSelect={(value) => {
                              handleMonthChange(calendarRef, viewedDate, value);
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

              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => handleYearChange(calendarRef, viewedDate, e)}
                className="h-8 w-20 font-semibold text-center border-0 bg-transparent hover:bg-background focus-visible:ring-1"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-background"
                onClick={() => goNext(calendarRef)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="h-8 w-20 font-semibold text-center border-0 bg-transparent hover:bg-background focus-visible:ring-1">
                {!isCurrentMonth() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 hidden sm:flex"
                    onClick={() => goToday(calendarRef)}
                  >
                    Today
                  </Button>
                )}
              </div>
            </div>
            {/* Right Section: Action Buttons */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
              {previewPosts.length === 0 ? (
                <Button
                  variant="outline"
                  onClick={generateSchedule}
                  disabled={isGeneratingSchedule}
                  className="gap-2 h-9"
                  size="sm"
                >
                  <Sparkles className={cn("h-4 w-4", isGeneratingSchedule && "animate-spin")} />
                  <span className="hidden sm:inline">
                    {isGeneratingSchedule ? "Generating..." : "Lên lịch đăng"}
                  </span>
                  <span className="sm:hidden">
                    {isGeneratingSchedule ? "..." : "AI"}
                  </span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={undoSchedule}
                    className="gap-2 h-9"
                    size="sm"
                  >
                    <Undo2 className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Undo ({previewPosts.length})
                    </span>
                    <span className="sm:hidden">Undo</span>
                  </Button>
                  <Button
                    onClick={saveSchedule}
                    disabled={isSavingSchedule}
                    className="gap-2 h-9"
                    size="sm"
                  >
                    <Save className={cn("h-4 w-4", isSavingSchedule && "animate-pulse")} />
                    <span className="hidden sm:inline">
                      {isSavingSchedule ? "Saving..." : `Save ${previewPosts.length} Posts`}
                    </span>
                    <span className="sm:hidden">
                      {isSavingSchedule ? "..." : "Save"}
                    </span>
                  </Button>
                </>
              )}

              <Button
                onClick={() => router.push("/crm/marketing/posts/new")}
                className="gap-2 h-9"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
