import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
//@ts-ignore
import youtubeSearch from "youtube-search-api";
import { getServerSession } from "next-auth";
import { getLoggedInUser } from "@/lib/utils";
const MAX_QUEUE_LENGTH = 20;
var urlRegex =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYt = data.url.match(urlRegex);
    if (!isYt) {
      return NextResponse.json(
        {
          message: "Error while adding a stream 1st",
        },
        {
          status: 411,
        }
      );
    }

    const extractedId = data.url.split("?v=")[1];
    //@ts-ignore
    // const res = await youtubeSearch.GetVideoDetails(extractedId);
    const TIMEOUT_MS = 8000; // Set to 8 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    try {
      // Pass the signal to youtubeSearch request to handle timeouts
      res = await youtubeSearch.GetVideoDetails(extractedId, {
        signal: controller.signal,
      });
      console.log("Video details fetched:", res);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("YouTube API request timed out");
        return NextResponse.json(
          { message: "YouTube API request timed out" },
          { status: 504 }
        );
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId); // Clear timeout if completed
    }

    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );

    const existingActiveStream = await prismaClient.stream.count({
      where: {
        userId: data.creatorId,
      },
    });

    if (existingActiveStream > MAX_QUEUE_LENGTH) {
      return NextResponse.json({ message: "Queue is full" }, { status: 401 });
    }

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "YouTube",
        title: res.title ?? "can't get title",
        smallImg:
          (thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[thumbnails.length - 1].url) ?? "",
        bigImg: thumbnails[thumbnails.length - 1].url ?? "",
        addedById: data.creatorId,
      },
    });

    return NextResponse.json({
      ...stream,
      upvotes: 0,
      haveUpvotes: {
        haveUpvoted: false,
      },
      color: "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: JSON.stringify(error),
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      }
    );
  }

  if (!creatorId) {
    return NextResponse.json({
      message: "Creator ID is required",
    });
  }

  const [streams, activeStream] = await Promise.all([
    await prismaClient.stream.findMany({
      where: {
        userId: creatorId,
        played: false,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    await prismaClient.currentStreams.findFirst({
      where: {
        userId: creatorId,
      },
      include: {
        stream: true,
      },
    }),
  ]);

  return NextResponse.json({
    streams: streams?.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvotes: {
        haveUpvoted: rest.upvotes.length ? true : false,
      },
    })),
    activeStream,
  });
}
