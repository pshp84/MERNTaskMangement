import React, { useEffect, useState } from "react";
import { auth } from "@/lib/api";

// Component to render the user's name based on their ID
export function AssignedToCell({ userId }: { userId: number }) {
  const [userName, setUserName] = useState<string>("");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const users = await auth.users();
        const allUsers = users.data;
        const findUser = allUsers.find((user) => user.id === userId);
        if (findUser) {
          setUserName(findUser.username);
        }
      } catch (error) {
        setUserName("");
      }
    };

    fetchUser();
  }, [userId]);

  return <span className="max-w-[500px] truncate font-medium">{userName}</span>;
}
