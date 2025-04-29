"use client";

import { Table, useReactTable } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { Task } from "@/types";
import { auth, tasks } from "@/lib/api";
import { useAtom } from "jotai";
import { taskFilters } from "@/jotai";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function TaskTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });
  const [filter, setFilter] = useAtom(taskFilters);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
            value={filter.status}
            onChange={(e) => {
              setFilter((prevFilter:any) => ({
                ...prevFilter,
                status: e,
              }));
            }}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
            value={filter.priority}
            onChange={(e) => {
              setFilter((prevFilter:any) => ({
                ...prevFilter,
                priority: e,
              }));
            }}
          />
        )}
        <div className="md:ml-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={`w-full md:w-[300px] justify-start text-left font-normal ${
                  !date && "text-muted-foreground"
                }`}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from ?? new Date()}
                selected={date}
                onSelect={(selectedRange) => {
                  setDate(selectedRange);
                  if (selectedRange?.from && selectedRange?.to) {
                    const dueDateRange = {
                      from: format(selectedRange.from, "yyyy-MM-dd"),
                      to: format(selectedRange.to, "yyyy-MM-dd"),
                    };
                    setFilter((prevFilter:any) => ({
                      ...prevFilter,
                      dueDateFrom: dueDateRange.from,
                    }));
                    setFilter((prevFilter:any) => ({
                      ...prevFilter,
                      dueDateTo: dueDateRange.to,
                    }));
                  } else {
                    setFilter((prevFilter:any) => ({
                      ...prevFilter,
                      dueDateFrom: "",
                    }));
                    setFilter((prevFilter:any) => ({
                      ...prevFilter,
                      dueDateTo: "",
                    }));
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
