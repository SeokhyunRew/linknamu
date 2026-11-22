export type LinkItem = {
  id: string;
  title: string;
  url: string;
};

export type ProfileData = {
  name: string;
  bio: string;
  image: string;
  links: LinkItem[];
};

// TODO: 보여 주기용 더미 값. 실제 프로필 사진·링크 주소로 교체하세요.
export const profile: ProfileData = {
  name: "류석현",
  bio: "세계 최강 바이브코더",
  image: "/profile.svg",
  links: [
    { id: "github", title: "GitHub", url: "https://github.com/your-id" },
    { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com/in/your-id" },
    { id: "blog", title: "Blog", url: "https://example.com" },
  ],
};
