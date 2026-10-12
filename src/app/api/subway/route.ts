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

    if (data && data.realtimePosition && Array.isArray(data.realtimePosition)) {
      // 2호선 내선(0)/외선(1), 경의중앙선 상행(0)/하행(1) 방향 매칭
      const targetUpdn = (direction === '내선' || direction === '상행') ? '0' : '1';

      const filtered = data.realtimePosition.filter((train: any) => {
        const isLineMatch = train.subwayNm === targetLine || train.subwayId;
        const isUpdnMatch = train.updnLine === targetUpdn;
        return isLineMatch && isUpdnMatch;
      });

      const finalData = filtered.length > 0 ? filtered : data.realtimePosition;
      return NextResponse.json({ realtimePosition: finalData });
    }

    // 데이터가 없거나 API 키 미등록 시 Fallback Mock 데이터
    return NextResponse.json({
      realtimePosition: [
        {
          trainNo: targetLine === '2호선' ? "2201" : "3201",
          subwayNm: targetLine,
          statnNm: targetLine === '2호선' ? "강남" : "디지털미디어시티",
          statnTcv: "1",
          updnLine: (direction === '내선' || direction === '상행') ? '0' : '1'
        }
      ]
    });
  } catch (error) {
    console.error('Subway API Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch subway data' }, { status: 500 });
  }
}
