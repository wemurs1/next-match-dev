import { create } from 'zustand';
import { MessageDto } from '../types';
import { devtools } from 'zustand/middleware';

type MessageState = {
  messages: MessageDto[];
  add: (message: MessageDto) => void;
  remove: (id: string) => void;
  set: (messages: MessageDto[]) => void;
};

export const useMessageStore = create<MessageState>()(
  devtools(
    (set) => ({
      messages: [],
      add: (message) => set((state) => ({ messages: [message, ...state.messages] }), false, 'messages/add'),
      remove: (id) => set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }), false, 'messages/remove'),
      set: (messages) => set({ messages }, false, 'messages/set'),
    }),
    { name: 'MessageStore' },
  ),
);
