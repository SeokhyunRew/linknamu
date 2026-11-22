"use client";

import Image from "next/image";
import { useState } from "react";

type ProfileProps = {
  name: string;
  bio: string;
  image: string;
  fallbackImage: string;
};

export default function Profile({ name, bio, image, fallbackImage }: ProfileProps) {
  const [src, setSrc] = useState(image);

  return (
    <section className="flex flex-col items-center text-center">
      <Image
        src={src}
        alt={`${name} 프로필 사진`}
        width={112}
        height={112}
        unoptimized
        priority
        onError={() => setSrc(fallbackImage)}
        className="h-28 w-28 rounded-full bg-amber-50 object-cover ring-4 ring-white shadow-md dark:ring-slate-800"
      />
      <h1 className="mt-4 text-2xl font-bold text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)] dark:text-white dark:drop-shadow-[0_1px_3px_rgba(2,6,23,0.8)]">{name}</h1>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{bio}</p>
    </section>
  );
}
