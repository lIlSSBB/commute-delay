import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineName = searchParams.get('line') || '2호선';

  // Mock Data (서울열린데이터광장 realtimePosition 실제 응답 포맷)
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
    realtimePosition: lineName === '2호선' ? [
      {
        subwayId: "1002",
        subwayNm: "2호선",
        statnId: "1002000239",
        statnNm: "홍대입구",
        trainNo: "2201",
        lastRecptnDt: "20261011",
        recptnDt: "2026-10-11 22:50:00",
        updnLine: "0",
        statnTcv: "1", 
        trainSttus: "1",
        directAt: "0",
        lstcarAt: "0"
      },
      {
        subwayId: "1002",
        subwayNm: "2호선",
        statnId: "1002000240",
        statnNm: "신촌",
        trainNo: "2203",
        lastRecptnDt: "20261011",
        recptnDt: "2026-10-11 22:50:10",
        updnLine: "0",
        statnTcv: "2", 
        trainSttus: "1",
        directAt: "0",
        lstcarAt: "0"
      }
    ] : [
      {
        subwayId: "1063",
        subwayNm: "경의중앙선",
        statnId: "1063000320",
        statnNm: "디지털미디어시티",
        trainNo: "3201",
        lastRecptnDt: "20261011",
        recptnDt: "2026-10-11 22:50:00",
        updnLine: "0",
        statnTcv: "1", 
        trainSttus: "1",
        directAt: "0",
        lstcarAt: "0"
      },
      {
        subwayId: "1063",
        subwayNm: "경의중앙선",
        statnId: "1063000321",
        statnNm: "수색",
        trainNo: "3203",
        lastRecptnDt: "20261011",
        recptnDt: "2026-10-11 22:50:10",
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
