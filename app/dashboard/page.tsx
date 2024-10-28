import StreamView from "../components/StreamView";
import { getServerSession } from "next-auth";
import { prismaClient } from "../lib/db";

const creatorId = "040f9a17-13d6-41a0-b1d7-e32142fa4296";
export default async function Dashboard() {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  const userId = user?.id!;
  return (
    <>
      <StreamView creatorId={userId} playVideo={true} />
    </>
  );
}
