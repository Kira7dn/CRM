"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/ui/form";
import { Input } from "@shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import { HexColorPicker } from "react-colorful";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/ui/alert-dialog";
import { DateTimePicker } from "./date-picker";
import { Textarea } from "@shared/ui/textarea";
import { useEvents } from "./context/events-context";
import { useToast } from "@/@shared/hooks/use-toast";
import { ToastAction } from "@/@shared/ui/toast";

const eventAddFormSchema = z.object({
  title: z.string().min(1, { message: "Please enter a title." }),
  description: z.string().min(1, { message: "Please enter a description." }),
  start: z.date().refine((val) => val !== undefined, {
    message: "Please select a start time"
  }),
  end: z.date().refine((val) => val !== undefined, {
    message: "Please select an end time"
  }),
  color: z.string().min(1, { message: "Please select an event color." }),
});

type EventAddFormValues = z.infer<typeof eventAddFormSchema>;

interface AvailabilityCheckerEventAddFormProps {
  start: Date;
  end: Date;
}

export function AvailabilityCheckerEventAddForm({
  start,
  end,
}: AvailabilityCheckerEventAddFormProps) {
  const { events, addEvent } = useEvents();
  const {
    availabilityCheckerEventAddOpen,
    setAvailabilityCheckerEventAddOpen,
  } = useEvents();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventAddFormSchema>>({
    resolver: zodResolver(eventAddFormSchema),
  });

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      start: start,
      end: end,
      color: "#76c7ef",
    });
  }, [form, start, end]);

  async function onSubmit(data: EventAddFormValues) {
    const newEvent = {
      id: String(events.length + 1),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      color: data.color,
    };
    addEvent(newEvent);
    setAvailabilityCheckerEventAddOpen(false);
    toast({
      title: "Event added!",
      action: (
        <ToastAction altText={"Click here to dismiss notification"}>
          Dismiss
        </ToastAction>
      ),
    });
  }

  return (
    <AlertDialog open={availabilityCheckerEventAddOpen}>
      {/* <AlertDialogTrigger className="flex" asChild>
        <Card
          onClick={() => setAvailabilityCheckerEventAddOpen(true)}
          className="flex py-2 px-4 my-2 w-full bg-secondary hover:bg-secondary/80 cursor-pointer"
        >
          {start.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })}
        </Card>
      </AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Event</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Standup Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Daily session"
                      className="max-h-36"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
                      locale="en-US"
                      weekStartsOn={0}
                      showWeekNumber={false}
                      showOutsideDays={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">End</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
                      locale="en-US"
                      weekStartsOn={0}
                      showWeekNumber={false}
                      showOutsideDays={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild className="cursor-pointer">
                        <div className="flex flex-row w-full items-center space-x-2 pl-2">
                          <div
                            className={`w-5 h-5 rounded-full cursor-pointer`}
                            style={{ backgroundColor: field.value }}
                          ></div>
                          <Input {...field} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="flex mx-auto items-center justify-center">
                        <HexColorPicker
                          className="flex"
                          color={field.value}
                          onChange={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel
                onClick={() => setAvailabilityCheckerEventAddOpen(false)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit">Add Event</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
