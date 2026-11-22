"use client";

import { useEffect, useState } from "react";
import LinkCard from "@/components/LinkCard";
import type { LinkItem } from "@/data/profile";

type Counts = Record<string, number>;

export default function LinkList({ links }: { links: LinkItem[] }) {
  // 데이터를 받기 전에는 모두 0회로 보여 준다
  const [counts, setCounts] = useState<Counts>(() =>
    Object.fromEntries(links.map((link) => [link.id, 0])),
  );

  // 페이지가 열리면 모든 링크의 클릭 수를 한 번에 가져온다
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/clicks", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { counts: Counts }) => {
        // 응답 전에 눌린 클릭(+1)이 사라지지 않도록 더 큰 값을 남긴다
        setCounts((prev) => {
          const next = { ...prev };
          for (const [id, count] of Object.entries(data.counts)) {
            next[id] = Math.max(count, prev[id] ?? 0);
          }
          return next;
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("클릭 수 불러오기 실패:", err);
      });
    return () => controller.abort();
  }, []);

  const handleClick = (id: string) => {
    // 화면은 바로 +1 하고, 서버 응답이 오면 실제 값으로 맞춘다
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true, // 링크로 이동하면서 페이지가 닫혀도 요청이 끝까지 전송되도록
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { id: string; count: number }) => {
        setCounts((prev) => ({ ...prev, [data.id]: Math.max(data.count, prev[data.id] ?? 0) }));
      })
      .catch((err) => console.error("클릭 수 저장 실패:", err));
  };

  return (
    <ul className="mt-10 flex flex-col gap-4">
      {links.map((link) => (
        <li key={link.id}>
          <LinkCard link={link} clickCount={counts[link.id] ?? 0} onCountClick={handleClick} />
        </li>
      ))}
    </ul>
  );
}
