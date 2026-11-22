import NightScene from "./NightScene";
import SnowScene from "./SnowScene";

// 테마에 따라 배경 장면을 바꾼다. 밝은 모드: 눈 덮인 산속 오두막 / 다크 모드: 광안대교 밤바다
export default function Background() {
  return (
    <>
      <div className="dark:hidden">
        <SnowScene />
      </div>
      <div className="hidden dark:block">
        <NightScene />
      </div>
    </>
  );
}
