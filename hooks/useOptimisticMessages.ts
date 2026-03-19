import { Doc, Id } from "@/convex/_generated/dataModel";
import { useEffect, useMemo, useState } from "react";

// Extend Convex message type with optimistic fields
export type OptimisticMessage = Omit<
  Doc<"messages">,
  "_id" | "_creationTime"
> & {
  _id: string;
  isOptimistic: true;
  status: "sending" | "failed";
};

// Combined message type (server or optimistic)
export type Message = Doc<"messages"> | OptimisticMessage;

interface useOptimisticOptions {
  serverMessages: Doc<"messages">[] | undefined;
  matchId: Id<"matches">;
  senderId: Id<"users"> | undefined;
  sendMessage: (args: {
    matchId: Id<"matches">;
    senderId: Id<"users">;
    content: string;
  }) => Promise<Id<"messages">>;
}

interface UseOptimisticMessagesReturn {
  messages: Message[];
  handleSend: (content: string) => Promise<void>;
  handleRetry: (failedMessage: OptimisticMessage) => Promise<void>;
}

export function useOptimisticMessages({
  serverMessages,
  matchId,
  senderId,
  sendMessage,
}: useOptimisticOptions): UseOptimisticMessagesReturn {
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);

  // Find which optimistic messages have been confirmed by the server
  const confirmedOptimisticIds = useMemo(() => {
    if (!serverMessages) return new Set<string>();
    const confirmed = new Set<string>();
    for (let op of optimisticMessages) {
      const isConfirmed = serverMessages.some(
        (message) =>
          message.senderId === op.senderId &&
          message.content === op.content &&
          Math.abs(message.createdAt - op.createdAt) < 10000, // Within 10 seconds;
      );
      if (isConfirmed) {
        confirmed.add(op._id);
      }
    }
    return confirmed;
  }, [serverMessages, optimisticMessages]);

  // Clean up confirmed optimistic messages
  useEffect(() => {
    if (confirmedOptimisticIds.size > 0) {
      setOptimisticMessages((prev: OptimisticMessage[]) =>
        prev.filter(
          (msg: OptimisticMessage) => !confirmedOptimisticIds.has(msg._id),
        ),
      );
    }
  }, [confirmedOptimisticIds]);

  // // Merge server messages with pending optimistic ones
  // const messages = useMemo((): Message[] => {
  //   if (!serverMessages) return [];

  //   const pendingOptimistic = optimisticMessages.filter(
  //     (msg: OptimisticMessage) => !confirmedOptimisticIds.has(msg._id),
  //   );

  //   return [...serverMessages, ...pendingOptimistic].sort(
  //     (a, b) => a.createdAt - b.createdAt,
  //   );
  // }, [serverMessages, optimisticMessages, confirmedOptimisticIds]);


  // setOptimisticMessages((prev) =>
  //     prev.filter(
  //       (optimistic) =>
  //         !serverMessages.some(
  //           (server) => server.clientId === optimistic.clientId
  //         )
  //     )

  const messages = useMemo((): Message[] => {
    return [...(serverMessages ?? []), ...optimisticMessages].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
  }, [serverMessages, optimisticMessages]);


  // Send a message with optimistic update
  async function handleSend(content: string) {
    if (!matchId || !senderId) return;
    const now = Date.now();
    const optimisticId = `optimistic-${Date.now()}-${Math.random()}`;
// const clientId = crypto.randomUUID();
    const optimisticMessage: OptimisticMessage = {
      _id: optimisticId,
      matchId,
      senderId,
      isOptimistic: true,
      createdAt: now,
      read: false,
      status: "sending",
      content,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMessage({
        matchId,
        senderId,
        content,
      });

      // setOptimisticMessages((prev) =>
      //   prev.filter((msg) => msg._id !== optimisticId),
      // );
    } catch (error) {
      console.error("Failed to send message:", error);

      setOptimisticMessages((prev) => {
        return prev.map((msg) =>
          msg._id === optimisticId ? { ...msg, status: "failed" } : msg,
        );
      });
    }
  }

  async function handleRetry(failedMessage: OptimisticMessage) {
    setOptimisticMessages((prev) => {
      return prev.filter((msg) => msg._id != failedMessage._id);
    });

    await handleSend(failedMessage.content);
  }

  return {
    messages,
    handleSend,
    handleRetry,
  };
}
