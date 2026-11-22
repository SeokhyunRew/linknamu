import { MongoClient } from "mongodb";

// 서버리스(Vercel)·개발 서버 핫 리로드에서도 연결을 하나만 재사용하도록 전역에 보관한다.
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI 환경 변수가 없습니다. .env.local을 확인하세요.");
  }
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect().catch((err) => {
      // 실패한 연결을 붙잡고 있지 않도록 비워서 다음 요청에서 다시 시도한다
      globalForMongo._mongoClientPromise = undefined;
      throw err;
    });
  }
  return globalForMongo._mongoClientPromise;
}

export type ClickDoc = { _id: string; count: number };

export async function getClicksCollection() {
  const client = await getMongoClient();
  return client.db("linknamu").collection<ClickDoc>("clicks");
}
