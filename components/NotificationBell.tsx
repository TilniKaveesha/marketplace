// components/NotificationBell.tsx
"use client";
import { Bell, BellDot } from "lucide-react";
import { useNotifications } from "./NotificationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        {unreadCount > 0 ? (
          <>
            <BellDot className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          </>
        ) : (
          <Bell className="w-6 h-6" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-sm">No new notifications</DropdownMenuItem>
        ) : (
          notifications.map(notification => (
            <DropdownMenuItem
              key={notification.$id}
              onClick={() => {
                markAsRead(notification.$id);
                window.location.href = notification.link;
              }}
              className="py-2 border-b"
            >
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.$createdAt).toLocaleString()}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}