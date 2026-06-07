import { NextResponse } from 'next/server'

const BLAND_KEY = 'org_4b9e6f2f3b042f728814816879300affac10ee8d183d24bb3bd06d0ffade2d90862e58f4e8f3391837a069'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const callId = searchParams.get('call_id')
  if (!callId) return NextResponse.json({ error: 'missing call_id' }, { status: 400 })

  try {
    const res = await fetch(`https://api.bland.ai/v1/calls/${callId}`, {
      headers: { authorization: BLAND_KEY },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
