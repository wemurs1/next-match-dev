'use client';

import { getPusherClient } from '@/lib/pusher-client';
import { MessageDto } from '@/lib/types';
import { Channel } from 'pusher-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import MessageBox from './MessageBox';
import { formatShortDateTime } from '@/lib/util';
import { markMessagesAsRead } from '@/server/actions/messages';

type Props = {
  initialMessages: MessageDto[];
  currentUserId: string;
  chatId: string;
};

export default function MessageList({ initialMessages, currentUserId, chatId }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const channelRef = useRef<Channel | null>(null);

  const handleNewMessage = useCallback(
    async (message: MessageDto) => {
      setMessages((prevState) => {
        return [...prevState, message];
      });

      if (message.senderId !== currentUserId) {
        await markMessagesAsRead([message.id], message.senderId);
      }
    },
    [currentUserId],
  );

  const handleReadMessages = useCallback((messageIds: string[]) => {
    setMessages((prevState) =>
      prevState.map((message) =>
        messageIds.includes(message.id) ? { ...message, dateRead: new Date().toISOString() } : message,
      ),
    );
  }, []);

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = getPusherClient().subscribe(chatId);
      channelRef.current.bind('message:new', handleNewMessage);
      channelRef.current.bind('messages:read', handleReadMessages);
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
      }
    };
  }, [chatId, handleNewMessage, handleReadMessages]);

  return (
    <div className='flex-1 overflow-y-auto'>
      <ul>
        {messages?.length === 0 ? (
          <p>No messages yet. Start the conversation</p>
        ) : (
          <>
            {messages?.map((message) => (
              <MessageBox key={message.id} message={message} currentUserId={currentUserId} />
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
