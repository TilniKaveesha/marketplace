"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Client, Databases, Query } from "appwrite";
import { APP_CONFIG } from "@/lib/app-config";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button"; // Import your Button component

type Notification = {
  $id: string;
  $createdAt: string;
  message: string;
  read: boolean;
  link: string;
};

const NotificationContext = createContext<{
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const client = new Client()
      .setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT)
      .setProject(APP_CONFIG.APPWRITE.PROJECT_ID);

    const databases = new Databases(client);

    const fetchNotifications = async () => {
      try {
        const res = await databases.listDocuments(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
          [Query.equal("read", false)]
        );
        const fetchedNotifications = res.documents.map(doc => ({
          $id: doc.$id,
          
          message: doc.message,
          read: doc.read,
          link: doc.link
        } as Notification));
        setNotifications(fetchedNotifications);
        setUnreadCount(res.total);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    const unsubscribe = client.subscribe(
      `databases.${APP_CONFIG.APPWRITE.DATABASE_ID}.collections.${APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID}.documents`,
      (response: { events: string[]; payload: Notification }) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newNotification = response.payload;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          toast({
            title: newNotification.message,
            action: (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = newNotification.link}
              >
                View
              </Button>
            ),
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const markAsRead = async (id: string) => {
    const client = new Client()
      .setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT)
      .setProject(APP_CONFIG.APPWRITE.PROJECT_ID);

    const databases = new Databases(client);

    try {
      await databases.updateDocument(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
        id,
        { read: true }
      );
      setNotifications((prev) => prev.filter((n) => n.$id !== id));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);