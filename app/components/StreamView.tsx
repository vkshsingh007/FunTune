"use client";
import { useState, useEffect, useRef } from "react";
import { Music2, Plus, ChevronUp, ChevronDown, X, Share2 } from "lucide-react";
import { motion, AnimatePresence, color } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
//@ts-ignore
import YouTubePlayer from "youtube-player";
import Image from "next/image";
import { Stream } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
type StreamProps = Stream;
interface NewStreamProps extends StreamProps {
  upvotes: number;
  color: string;
  haveUpvotes: {
    haveUpvoted: boolean;
  };
}
const REFRESH_INTERVAL_MS = 10 * 1000;
export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo?: boolean;
}) {
  const session = useSession();
  const [videoUrl, setVideoUrl] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentStream, setCurrentStream] = useState<NewStreamProps | null>(
    null
  );
  const [queue, setQueue] = useState<NewStreamProps[]>([]);
  const [loading, setLoading] = useState(false);

  const videoPlayerRef = useRef(null);
  async function refreshStream() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`);
    const data = await res?.json();
    if (data.message !== "Unauthenticated") {
      setQueue([
        ...data.streams
          .map((song: StreamProps) => {
            const newColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
            return {
              ...song,
              color: newColor,
            };
          })
          .sort(
            (a: NewStreamProps, b: NewStreamProps) => b.upvotes - a.upvotes
          ),
      ]);
      setCurrentStream((video: StreamProps | null) => {
        if (video?.id === data.activeStream?.stream?.id) {
          return video;
        }
        return data.activeStream?.stream;
      });
    }
  }
  useEffect(() => {
    setCurrentRotation((prev) => (prev + 1) % 360);
    const interval = setInterval(() => {
      refreshStream();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!videoPlayerRef.current && currentStream !== null) {
      return;
    }

    let player = YouTubePlayer(videoPlayerRef.current);

    const videoId = currentStream?.extractedId.substring(0, 11);

    player.loadVideoById(videoId);

    player.playVideo();

    function videoEventHandler(event: any) {
      if (event.data === 0) {
        playNext();
      }
    }
    player.on("stateChange", videoEventHandler);

    return () => {
      player.destroy();
    };
  }, [currentStream, videoPlayerRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    const videoId = extractVideoId(e.target.value);
    setPreviewId(videoId);
  };

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  const handleAddSong = async () => {
    setLoading(true);
    if (previewId) {
      const newColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
      const res = await fetch("/api/streams/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: creatorId,
          url: videoUrl,
        }),
      });
      const newSong = await res.json();

      setQueue((prevQueue) => [...prevQueue, { ...newSong, color: newColor }]);

      setVideoUrl("");
      setPreviewId("");
      setIsAddingSong(false);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Fun Tune",
      text: "Vote for your favorite songs and help decide what plays next!",
      url: `${window.location.origin}/creator/${creatorId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Your fans can now join the Cosmic Jukebox.",
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Link copied to clipboard!",
          description:
            "Share this link with your fans to join the Cosmic Jukebox.",
        });
      }
    } catch (err) {
      toast({
        title: "Error sharing",
        description: "There was an problem sharing the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVotes = (id: string, isUpvote: boolean) => {
    setQueue((prevQueue) =>
      prevQueue
        .map((song) =>
          song.id === id
            ? {
                ...song,
                upvotes: isUpvote ? song.upvotes - 1 : song.upvotes + 1,
                haveUpvotes: {
                  haveUpvoted: !song.haveUpvotes.haveUpvoted,
                },
              }
            : song
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    );
    fetch(`/api/streams/${!isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({ streamId: id }),
    });
  };

  const playNext = async () => {
    if (queue.length > 0) {
      const data = await fetch("/api/streams/next", {
        method: "GET",
      });
      const json = await data.json();
      setCurrentStream(json.stream);
      setQueue((q) => q.filter((x) => x.id !== json.stream?.id));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center">
            <Music2 className="mr-2" /> Fun Tune
          </h1>

          <div className="flex space-x-4">
            <Button
              onClick={handleShare}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Share2 className="mr-2" /> Share
            </Button>
            <Button
              onClick={() => setIsAddingSong(true)}
              className="bg-white text-black hover:bg-gray-200"
            >
              <Plus className="mr-2" /> Add Song
            </Button>

            {session.data?.user ? (
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-md transition-colors duration-300"
                onClick={() => signOut()}
              >
                SignOut
              </Button>
            ) : (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-full text-md transition-colors duration-300"
                onClick={() => signIn()}
              >
                Sign in
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="aspect-square relative">
              <div
                className="w-full h-full absolute"
                style={{
                  background: `conic-gradient(from ${currentRotation}deg, #FF6B6B, #4ECDC4, #45B7D1, #F7B731)`,
                }}
              ></div>
              <div className="absolute inset-1 bg-black flex items-center justify-center">
                <div ref={videoPlayerRef} />
                {/* <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentStream?.extractedId.substring(
                    0,
                    11
                  )}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe> */}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Now Playing</h2>
              <p className="text-xl">{currentStream?.title}</p>
            </div>
            {playVideo && (
              <div>
                <Button
                  onClick={playNext}
                  className="w-full bg-purple-600 hover:bg-purple-600 text-white "
                >
                  Play Next
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Song Queue</h2>
            <AnimatePresence>
              {queue.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-4 p-4 rounded-lg"
                  style={{ backgroundColor: `${song.color}22` }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-black font-bold text-xl"
                    style={{ backgroundColor: song.color }}
                  >
                    {index + 1}
                  </div>
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={song.bigImg || "/placeholder.svg"}
                      alt={`Thumbnail for ${song.title}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    <p className="text-sm opacity-70">{song.upvotes} votes</p>
                  </div>
                  <div className="flex flex-col">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleVotes(song.id, song.haveUpvotes?.haveUpvoted)
                      }
                      variant="ghost"
                      className="hover:bg-white/40"
                    >
                      {!song.haveUpvotes?.haveUpvoted ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isAddingSong && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4"
            >
              <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Add a Song</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddingSong(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <Input
                  type="text"
                  placeholder="Paste YouTube URL"
                  value={videoUrl}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-none text-white placeholder-white/50 mb-4"
                />
                {previewId && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${previewId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                <Button
                  onClick={handleAddSong}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black"
                >
                  {loading ? "Loading..." : "Add to Queue"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>{loading && <></>}</div>
    </div>
  );
}
