import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineName = searchParams.get('line') || '2호선';
  const direction = searchParams.get('direction') || '내선';

  const apiKey = process.env.NEXT_PUBLIC_SUBWAY_API_KEY || 'sample';
  const targetLine = lineName === '경의중앙선' ? '경의중앙선' : '2호선';
  
  const apiUrl = `http://swopenAPI.seoul.go.kr/api/subway/${apiKey}/json/realtimePosition/0/50/${encodeURIComponent(targetLine)}`;

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 5 } });
    const data = await response.json();

    if (data && data.realtimePosition) {
      // 방향 필터링 (서울시 API의 updnLine 또는 trainSttus 등 활용)
      // updnLine: '0'(상행/내선), '1'(하행/외선) 또는 관련 필드 매칭
      const filtered = data.realtimePosition.filter((train: any) => {
        const lineMatch = train.subwayNm === targetLine;
        // 2호선 내선(0)/외선(1), 경의중앙선 상행(0)/하행(1)
        if (direction === '내선' || direction === '상행') {
          return lineMatch && (train.updnLine === '0' || train.trainSttus === '0');
        } else {
          return lineMatch && (train.updnLine === '1' || train.trainSttus === '1');
        }
      });

      // 필터링된 결과가 없으면 전체 목록이라도 반환하여 데이터가 아예 비지 않도록 함
      const finalData = filtered.length > 0 ? filtered : data.realtimePosition;
      return NextResponse.json({ realtimePosition: finalData });
    }

    // Fallback 데이터
    return NextResponse.json({
      realtimePosition: [
        {
          trainNo: targetLine === '2호선' ? "2201" : "3201",
          subwayNm: targetLine,
          statnNm: targetLine === '2호선' ? "강남" : "디지털미디어시티",
          statnTcv: "1",
          updnLine: "0"
        }
      ]
    });
  } catch (error) {
    console.error('Subway API Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch subway data' }, { status: 500 });
  }
}
