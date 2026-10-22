import PusherServer from 'pusher';

declare global {
  var pusherServerInstance: PusherServer | undefined;
}

// pusher cloud
// if (!global.pusherServerInstance) {
//   global.pusherServerInstance = new PusherServer({
//     appId: process.env.PUSHER_APP_ID!,
//     key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
//     secret: process.env.PUSHER_SECRET!,
//     cluster: 'eu',
//     useTLS: true,
//   });
// }

// soketi
if (!global.pusherServerInstance) {
  global.pusherServerInstance = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    useTLS: false,
    host: process.env.PUSHER_HOST || 'localhost',
    port: process.env.PUSHER_PORT || '6001',
  })
}

export const pusherServer = global.pusherServerInstance;
