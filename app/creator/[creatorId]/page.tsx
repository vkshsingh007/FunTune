import StreamView from "@/app/components/StreamView";
import React from "react";

const creatorId = ({ params }: { params: { creatorId: string } }) => {
  return (
    <>
      <StreamView creatorId={params.creatorId} playVideo={false} />
    </>
  );
};

export default creatorId;
