addEventListener("DOMContentLoaded", () => {
  const apiUrl = "qwen.lhf.us.kg" // 这里填写你获得的 API 地址
  const outputContainer = document.getElementById("ai-output");

  // 测试数据
  const postTitle = "《Hi,Cloudflare Workers AI》";
  const postBeforeContent = `
    这货其实已经发布有段时间了，但，效果嘛，差强人意。可人家免费啊，还自带 Workers 调用，省去鉴权若干代码，自个儿绑个域名，每分钟 100 次，美滋滋～
    
    以下代码配套「哔哔广场」食用，当然也可自行折腾。
    
    新建 Cloudflare Workers 丢入以下代码保存并绑定域名，填入广场设置处即可～
    
    import { Ai } from './vendor/@cloudflare/ai.js';
    export default {
        async fetch(request, env, ctx) {
          const jsonheaders = {
            "content-type": "text/event-stream",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': "*",
            'Access-Control-Allow-Headers': "*",
            'Access-Control-Max-Age': '86400',
          };
    
        const url = new URL(request.url);
        const query = decodeURIComponent(url.searchParams.get('q'));
            const ai = new Ai(env.AI, { sessionOptions: { ctx: ctx } });
            let chat = {
              messages: [
                { role: 'system', content: 'You are a helpful and responsive assistant, you answer questions directly and provide instruction unless told otherwise.Respond in Chinese.' },
                { role: 'user', content: query }
              ]
            };
            const stream = await ai.run(
                "@cf/mistral/mistral-7b-instruct-v0.1",
                { messages: chat.messages, stream: true  }
            );
            return new Response(stream,
                { headers: jsonheaders, }
            );
        }
    }
    以上代码的提示词可以自己更换。
    
    其中文本生成的模型有这几种可以设定：
    
    @cf/meta/llama-2-7b-chat-fp16
    @cf/mistral/mistral-7b-instruct-v0.1
    @cf/meta/llama-2-7b-chat-int8
  `;
  const postContent = postBeforeContent.replace(/\n/g, '').replace(/[ ]+/g, ' ').replace(/<pre>[\s\S]*?<\/pre>/g, '').substring(0, 1800);

  const evSource = new EventSource(apiUrl + `/?q=${postTitle}，文章内容：${postContent}`);
  evSource.onmessage = (event) => {
    if (event.data == "[DONE]") {
      evSource.close();
      return;
    } else {
        const data = JSON.parse(event.data);
        outputContainer.textContent += data.response ;
    }
  }
});
