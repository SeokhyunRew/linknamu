export type LinkItem = {
  id: string;
  title: string;
  url: string;
  /** 제목 앞에 표시할 아이콘 이미지 주소 (서비스 favicon) */
  icon?: string;
  /** 지정하면 링크 이동 대신 이 값을 클립보드에 복사합니다 */
  copyText?: string;
};

export type ProfileData = {
  name: string;
  bio: string;
  image: string;
  /** image를 불러오지 못했을 때 대신 보여 줄 이미지 */
  fallbackImage: string;
  links: LinkItem[];
};

export const profile: ProfileData = {
  name: "류석현",
  bio: "세계 최강 바이브코더",
  // 케로로 이미지 출처: Keroro Wiki (keroro.fandom.com/wiki/Keroro), 얼굴 부분을 잘라 저장
  image: "/keroro.png",
  fallbackImage: "https://placehold.co/112x112/orange/white",
  links: [
    {
      id: "github",
      title: "GitHub",
      url: "https://github.com/SeokhyunRew",
      icon: "https://github.com/favicon.ico",
    },
    {
      id: "blog",
      title: "Blog",
      url: "https://velog.io/@krewooo/series",
      icon: "https://velog.io/favicon.ico",
    },
    {
      id: "email",
      title: "Email",
      url: "mailto:SeokHyun.Rew@LinaKorea.com",
      copyText: "SeokHyun.Rew@LinaKorea.com",
      icon: "https://www.lina.co.kr/favicon.ico",
    },
  ],
};
