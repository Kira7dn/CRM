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
  const {
    previewPosts,
    isGeneratingSchedule,
    isSavingSchedule,
    brand,
    products,
    generateSchedule: generateScheduleStore,
    savePlannerPosts,
    undoSchedule,
  } = usePostStore();
  const router = useRouter();

  // Helper function that was in the hook
  const generateSchedule = async () => {
    const selectedProducts = products.filter((p: any) =>
      brand.selectedProductIds?.includes(p.id)
    )
    return generateScheduleStore(brand, selectedProducts)
  }

  const saveSchedule = async () => {
    return savePlannerPosts()
  }

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
    <div className="w-full border-b overflow-x-hidden">
      <div className="container mx-auto px-4 py-3">
        {/* Mobile: Stack vertically, Desktop: Horizontal */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">

          <div className="flex gap-2 flex-1 min-w-0 flex-col lg:flex-row justify-start md:justify-between">
            {/* Filter - Always visible */}
            <div className="shrink-0">
              <PostFilter />
            </div>

            {/* Date Navigation Controls */}
            <div className="flex items-center gap-1 justify-center lg:justify-start min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-background"
                onClick={() => goPrev(calendarRef)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover open={monthSelectOpen} onOpenChange={setMonthSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="h-8 px-2 sm:px-3 font-semibold hover:bg-background min-w-20 sm:min-w-25 justify-between"
                  >
                    <span className="truncate">
                      {months.find((m) => m.value === String(selectedMonth))?.label}
                    </span>
                    <ChevronsUpDown className="ml-1 sm:ml-2 h-3.5 w-3.5 opacity-50 shrink-0" />
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
                className="h-8 w-16 sm:w-20 font-semibold text-center border-0 bg-transparent hover:bg-background focus-visible:ring-1 shrink-0"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-background"
                onClick={() => goNext(calendarRef)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {/* <div className="h-8 shrink-0 w-20">
                {!isCurrentMonth() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToday(calendarRef)}
                  >
                    Today
                  </Button>
                )}
              </div> */}
            </div>

            {/*Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 justify-start">
              {previewPosts.length === 0 ? (
                <Button
                  variant="outline"
                  onClick={generateSchedule}
                  disabled={isGeneratingSchedule}
                  className="gap-2"
                  size="sm"
                >
                  <Sparkles className={cn("h-4 w-4", isGeneratingSchedule && "animate-spin")} />
                  <span className="hidden sm:inline">
                    {isGeneratingSchedule ? "Generating..." : "Lên lịch đăng"}
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
                className="gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Post</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
