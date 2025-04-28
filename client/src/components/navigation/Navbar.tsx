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
import { UserCircleIcon } from "@heroicons/react/24/outline";

export function Navbar() {
  const router = useRouter();
  const [, setNotifications] = useState();
  const [data, setData] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [notificationCount, setNotificationCount] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [storedUser, setStoredUser] = useState("");

  const handleUsernameClick = () => {
    setShowLogout((prev) => !prev);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.id) {
      setIsLoggedIn(true);
      setStoredUser(user.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsLoggedIn(false);
    setShowLogout(false);
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
      setNotificationCount((prev) => prev + 1);
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
            <Popover
              open={popoverOpen}
              onOpenChange={(open) => {
                setPopoverOpen(open);
                if (open) {
                  setNotificationCount(0); // 👈 Reset count when popover opens
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

            <div className="relative">
              <button
                onClick={handleUsernameClick}
                className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-full hover:border-blue-400 hover:text-blue-600 cursor-pointer"
              >
                <UserCircleIcon className="w-8 h-8 text-gray-700" />
                <span className="hidden md:block">{storedUser || "User"}</span>
              </button>

              {showLogout && (
                <div className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <></>
        )}
      </nav>
    </>
  );
}
