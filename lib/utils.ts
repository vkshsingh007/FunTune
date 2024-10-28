import { prismaClient } from "@/app/lib/db";
import { clsx, type ClassValue } from "clsx";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getLoggedInUser() {
  const session = await getServerSession();
  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user || user instanceof NextResponse) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }
  return { id: user.id, email: user.email, name: user.provider };
}
