"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GradingSystemsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/Schools");
  }, [router]);

  return null;
}
