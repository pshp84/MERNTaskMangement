"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ToastContainer } from "react-toastify";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import moment from "moment";
import { wsService } from "@/lib/websocket";
import { tasks } from "@/lib/api";
import { useAtom } from "jotai";
import { isLoggedInAtom } from "@/jotai";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [notifications, setNotifications] = useState();
  const [data, setData] = useState<any[]>([]);
  console.log(data)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.id) {
      setIsLoggedIn(true);
    }
  }, []);

  const loadTasks = async () => {
    try {
      await tasks.getAll();
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    // Connect to WebSocket
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user.id) return;

    if (user.id) {
      wsService.connect(user.id);
    }
    loadTasks();
    // Subscribe to task updates
    const unsubscribe = wsService.subscribe((data) => {
      setNotifications(data as any);

      setData((prev) => {
        const updated = [data, ...prev];
        return updated;
      });
      setNotificationCount((prev) => prev + 1);
      loadTasks();
    });

    return () => {
      wsService.disconnect();
      unsubscribe();
    };
  }, [isLoggedIn]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background rounded-t-2xl">
          <SidebarTrigger />
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (open) {
                setNotificationCount(0);
              }
            }}
          >
            <PopoverTrigger asChild>
              <div className="hover:text-blue-600 cursor-pointer">
                <BellIcon width={24} height={24} />
                {notificationCount > 0 && (
                  <span className="absolute notificationIcon ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-80 max-h-96 overflow-y-auto">
              <div className="grid gap-2">
                {data.length <= 0 && (
                  <div className="space-y-2">No notifications found</div>
                )}
                {data.map((el, index) => (
                  <div key={index} className="space-y-2">
                    <div className="w-full text-muted-foreground text-black text-xl">
                      {el.type === "TASK_CREATED" ? (
                        <div
                          className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 flex flex-col"
                          role="alert"
                        >
                          <span className="font-medium">
                            {`Task created: ${el?.task?.title ? el?.task?.title : ""}`}
                          </span>
                          <span>
                            {moment(el.date).format("MMMM Do h:mm A")}
                          </span>
                        </div>
                      ) : el.type === "TASK_UPDATED" ? (
                        <div
                          className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 flex flex-col"
                          role="alert"
                        >
                          <span className="font-medium">
                            {`Task updated: ${el?.task?.title ? el?.task?.title : ""}`}
                          </span>
                          <span>
                            {moment(el.date).format("MMMM Do h:mm A")}
                          </span>
                        </div>
                      ) : el.type === "TASK_DELETED" ? (
                        <div
                          className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 flex flex-col"
                          role="alert"
                        >
                          <span className="font-medium">
                            {" "}
                            {`Task deleted: ${el?.task?.title ? el?.task?.title : ""}`}
                          </span>
                          <span>
                            {moment(el.date).format("MMMM Do h:mm A")}
                          </span>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {children}
        <ToastContainer position="top-right" autoClose={5000} />
      </main>
    </SidebarProvider>
  );
}
