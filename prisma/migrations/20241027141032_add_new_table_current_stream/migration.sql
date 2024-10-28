-- CreateTable
CREATE TABLE "CurrentStreams" (
    "userId" TEXT NOT NULL,
    "streamId" TEXT,

    CONSTRAINT "CurrentStreams_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStreams_streamId_key" ON "CurrentStreams"("streamId");

-- AddForeignKey
ALTER TABLE "CurrentStreams" ADD CONSTRAINT "CurrentStreams_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
