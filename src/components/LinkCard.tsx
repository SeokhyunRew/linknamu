"use client";

import type { MouseEvent } from "react";
import type { LinkItem } from "@/data/profile";

type LinkCardProps = {
  link: LinkItem;
};

async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // http 환경 등 Clipboard API를 쓸 수 없을 때의 대체 방법
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function LinkCard({ link }: LinkCardProps) {
  const isExternal = link.url.startsWith("http");

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.copyText) return;
    e.preventDefault();
    try {
      await copyToClipboard(link.copyText);
      alert("이메일 주소가 복사 되었습니다.");
    } catch {
      alert(`복사에 실패했습니다: ${link.copyText}`);
    }
  };

  return (
    <a
      href={link.url}
      onClick={handleClick}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-link-id={link.id}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-5 py-4 font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 backdrop-blur-md dark:border-slate-600/60 dark:bg-slate-800/75 dark:hover:bg-slate-700/85"
    >
      {link.icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.icon} alt="" aria-hidden width={20} height={20} className="h-5 w-5 rounded-sm dark:bg-white dark:p-px" />
      )}
      <span>{link.title}</span>
    </a>
  );
}
