import { ChatWrapper } from "@/components/ChatWrapper";
import { ragChat } from "@/lib/rag-chat";
import { reconstructUrl } from "@/lib/reconstructUrl";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

interface PageProps {
  params: {
    url: string | string[] | undefined;
  };
}

const Page = async ({ params }: PageProps) => {
  const sessionCookie = cookies().get("sessionId")?.value;
  const { url } = params;
  const reconstructedUrl = reconstructUrl({ url: url as string[] });

  const isIndexed = await redis.sismember("indexedUrls", reconstructedUrl);

  const sessionId = (reconstructedUrl + "--" + sessionCookie).replace(
    /\//g,
    ""
  );

  const initialMsgs = await ragChat.history.getMessages({
    amount: 10,
    sessionId,
  });

  if (!isIndexed) {
    await ragChat.context.add({
      type: "html",
      source: reconstructedUrl,
      // config: { chunkOverlap: 50, chunkSize: 200 },
    });
    await redis.sadd("indexedUrls", reconstructedUrl);
  }

  return <ChatWrapper sessionId={sessionId} initialMsgs={initialMsgs} />;
};

export default Page;
