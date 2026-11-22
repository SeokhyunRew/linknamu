import { NextResponse } from "next/server";
import { getClicksCollection } from "@/lib/mongodb";
import { profile } from "@/data/profile";

// 클릭 수는 매번 최신 값을 읽어야 하므로 캐시하지 않는다
export const dynamic = "force-dynamic";

const LINK_IDS = profile.links.map((link) => link.id);

/** 모든 링크의 클릭 수를 한 번에 돌려준다. 예: { "counts": { "github": 42, ... } } */
export async function GET() {
  try {
    const clicks = await getClicksCollection();
    const docs = await clicks.find({ _id: { $in: LINK_IDS } }).toArray();

    const counts: Record<string, number> = Object.fromEntries(LINK_IDS.map((id) => [id, 0]));
    for (const doc of docs) counts[doc._id] = doc.count;

    return NextResponse.json({ counts });
  } catch (err) {
    console.error("[GET /api/clicks]", err);
    return NextResponse.json({ error: "클릭 수를 불러오지 못했습니다." }, { status: 500 });
  }
}

/** 링크 하나의 클릭 수를 1 올린다. body: { "id": "github" } → { "id": "github", "count": 43 } */
export async function POST(request: Request) {
  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 프로필에 있는 링크만 집계해서 아무 값이나 DB에 쌓이지 않게 한다
  if (typeof id !== "string" || !LINK_IDS.includes(id)) {
    return NextResponse.json({ error: "알 수 없는 링크입니다." }, { status: 400 });
  }

  try {
    const clicks = await getClicksCollection();
    const doc = await clicks.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" },
    );
    return NextResponse.json({ id, count: doc?.count ?? 1 });
  } catch (err) {
    console.error("[POST /api/clicks]", err);
    return NextResponse.json({ error: "클릭 수를 저장하지 못했습니다." }, { status: 500 });
  }
}
