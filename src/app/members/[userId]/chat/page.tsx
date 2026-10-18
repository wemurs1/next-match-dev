import { getMessageThread } from '@/server/actions/messages';
import ChatForm from './ChatForm';

export default async function ChatPage(props: PageProps<'/members/[userId]/chat'>) {
  const { userId } = await props.params;
  const messages = await getMessageThread(userId);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        <ul>
          {messages?.map(message=>(
            <li key={message.id}>
              <p>{message.text}</p>
            </li>
          ))}
        </ul>
      </div>
      <ChatForm />
    </div>
  );
}
