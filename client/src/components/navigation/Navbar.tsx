"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { wsService } from "@/lib/websocket";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BellIcon } from "@heroicons/react/24/outline";
import { tasks } from "@/lib/api";
import { isLoggedInAtom } from "@/jotai";
import { useAtom } from "jotai";
import moment from "moment";

export function Navbar() {
  const router = useRouter();
  const [, setNotifications] = useState();
  const [data, setData] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.id) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/");
  };

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
      loadTasks();
    });

    return () => {
      wsService.disconnect();
      unsubscribe();
    };
  }, [isLoggedIn]);

  return (
    <>
      <nav className="flex gap-6 items-center p-4 border-b mb-4 bg-white">
        <Link href="/" className="font-semibold text-lg">
          Task Manager
        </Link>
        <div className="flex-1" />
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-blue-600 cursor-pointer"
            >
              Logout
            </button>
            {data.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="hover:text-blue-600 cursor-pointer">
                    <BellIcon width={24} height={24} />
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-80 max-h-96 overflow-y-auto">
                  <div className="grid gap-2">
                    {data.map((el, index) => (
                      <div key={index} className="space-y-2">
                        <p className="w-full text-muted-foreground text-black text-xl">
                          {el.type === "TASK_CREATED" ? (
                            <div
                              className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 flex flex-col"
                              role="alert"
                            >
                              <span className="font-medium">
                                {"Task created successfully."}
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
                                {"Task updated successfully."}
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
                                {"Task deleted successfully."}
                              </span>
                              <span>
                                {moment(el.date).format("MMMM Do h:mm A")}
                              </span>
                            </div>
                          ) : (
                            ""
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        ) : (
          <>
            <Link href="/register" className="hover:text-blue-600">
              Register
            </Link>
          </>
        )}
      </nav>
    </>
  );
}
