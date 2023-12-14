import { GroupsApi } from '@jedzenie/splitwise';
import { App, AppOptions } from '@slack/bolt';

const options = {
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT || 3000)
} satisfies AppOptions


const splitwiseApi = new GroupsApi({
})
const app = new App(options);

app.event('app_mention', async ({ event, say})=> {
  const ts = event.thread_ts ?? event.ts
  
  const res = await app.client.conversations.replies({
    token: options.token,
    channel: event.channel,
    ts
  })

  const messages = res.messages.slice(1).filter(({bot_id}) => !bot_id)
  console.log(messages)

  if(messages.length > 0)  {
    getGroupIdGet
  }
  await say({thread_ts: ts, text: "Moo"})
});


(async () => {
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();