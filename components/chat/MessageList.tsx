import { Id } from "@/convex/_generated/dataModel";
import { Message, OptimisticMessage } from "@/hooks/useOptimisticMessages";
import React, { forwardRef, useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: Id<"users"> | undefined;
  onRetry: (message: OptimisticMessage) => void;
}

export const MessageList = forwardRef<FlatList, MessageListProps>(
  function MessageList({ messages, currentUserId, onRetry }, ref) {
    const renderItem = useCallback(
      ({ item }: { item: Message }) => {
        const isOptimistic = "isOptimistic" in item && item.isOptimistic;
        const status = isOptimistic
          ? (item as OptimisticMessage).status
          : undefined;

        return (
          <MessageBubble
            status={status}
            content={item.content}
            isOwn={item.senderId === currentUserId}
            timestamp={item.createdAt}
            onRetry={
              status === "failed"
                ? () => onRetry(item as OptimisticMessage)
                : undefined
            }
          />
        );
      },
      [currentUserId, onRetry],
    );

    const handleContentSizeChange = useCallback(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.scrollToEnd({ animated: false });
      }
    }, [ref]);

    return (
      <FlatList
        data={messages}
        ref={ref}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={handleContentSizeChange}
      />
    );
  },
);

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 8,
  },
});
