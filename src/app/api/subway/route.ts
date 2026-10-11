import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineName = searchParams.get('line') || '경의중앙선';

  // 실제 API 키가 없을 경우를 대비한 Mock 데이터 구조
  const mockData = {
    errorMessage: {
      status: 200,
      code: "INFO-000",
      message: "정상 처리되었습니다.",
      link: "",
      developerMessage: "",
      total: 2,
      rowNum: 2
    },
    realtimePosition: [
      {
        subwayId: "1063",
        subwayNm: lineName,
        statnId: "1063000320",
        statnNm: "디지털미디어시티",
        trainNo: "3201",
        lastRecptnDt: "20261011",
        recptnDt: "2026-10-11 22:30:00",
        updnLine: "0",
        statnTcv: "1", 
        trainSttus: "1",
        directAt: "0",
        lstcarAt: "0"
      },
      {
        subwayId: "1063",
        subwayNm: lineName,
        statnId: "1063000321",
        statnNm: "가수색",
        trainNo: "3203",
        lastRecptnDt: "20261011",
        recptnDt: "2026-10-11 22:30:10",
        updnLine: "0",
        statnTcv: "2", 
        trainSttus: "1",
        directAt: "0",
        lstcarAt: "0"
      }
    ]
  };

  return NextResponse.json(mockData);
}
