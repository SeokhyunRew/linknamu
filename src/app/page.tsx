import LinkList from "@/components/LinkList";
import Profile from "@/components/Profile";
import ThemeToggle from "@/components/ThemeToggle";
import Background from "@/components/background/Background";
import { profile } from "@/data/profile";

// wireframe.png 구성: 원형 프로필 사진 → 이름 → 한 줄 소개 → 세로 링크 카드 목록
export default function Home() {
  return (
    <>
      <Background />

      <main className="relative z-10 mx-auto min-h-screen w-full max-w-md px-6 pb-12 pt-16">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <Profile
          name={profile.name}
          bio={profile.bio}
          image={profile.image}
          fallbackImage={profile.fallbackImage}
        />

        <LinkList links={profile.links} />
      </main>
    </>
  );
}
