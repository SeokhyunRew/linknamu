import type { LinkItem } from "@/data/profile";

type LinkCardProps = {
  link: LinkItem;
};

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-link-id={link.id}
      className="block w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      {link.title}
    </a>
  );
}
