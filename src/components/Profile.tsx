import Image from "next/image";

type ProfileProps = {
  name: string;
  bio: string;
  image: string;
};

export default function Profile({ name, bio, image }: ProfileProps) {
  return (
    <section className="flex flex-col items-center text-center">
      <Image
        src={image}
        alt={`${name} 프로필 사진`}
        width={112}
        height={112}
        unoptimized
        priority
        className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md dark:ring-slate-800"
      />
      <h1 className="mt-4 text-2xl font-bold">{name}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{bio}</p>
    </section>
  );
}
