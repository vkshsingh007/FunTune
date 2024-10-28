"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Redirect = () => {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.data?.user) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  return null;
};
export default Redirect;
