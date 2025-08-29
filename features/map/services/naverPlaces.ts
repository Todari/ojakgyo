export type SearchResult = {
  title: string;
  address?: string;
  x: number; // lng
  y: number; // lat
};

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  const hasNaverApiKeys = !!process.env.EXPO_PUBLIC_NAVER_MAPS_KEY_ID && !!process.env.EXPO_PUBLIC_NAVER_MAPS_KEY;
  if (!hasNaverApiKeys) {
    throw new Error('네이버 지도 API 키가 설정되지 않았습니다.');
  }

  const url = `https://naveropenapi.apigw.ntruss.com/map-place/v1/search?query=${encodeURIComponent(query)}&display=5`;
  const res = await fetch(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': process.env.EXPO_PUBLIC_NAVER_MAPS_KEY_ID as string,
      'X-NCP-APIGW-API-KEY': process.env.EXPO_PUBLIC_NAVER_MAPS_KEY as string,
    },
  });
  const json = await res.json();
  const items: SearchResult[] = (json?.places || json?.items || []).map((item: any) => ({
    title: item.name || item.title,
    address: item.road_address || item.address,
    x: parseFloat(item.x || item.mapx || item.longitude),
    y: parseFloat(item.y || item.mapy || item.latitude),
  })).filter((v: any) => Number.isFinite(v.x) && Number.isFinite(v.y));
  return items;
}


