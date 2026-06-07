import { NextResponse } from 'next/server'

const BLAND_KEY = 'org_4b9e6f2f3b042f728814816879300affac10ee8d183d24bb3bd06d0ffade2d90862e58f4e8f3391837a069'

export async function GET() {
  try {
    const res = await fetch('https://api.bland.ai/v1/calls?page_size=500', {
      headers: { authorization: BLAND_KEY },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
