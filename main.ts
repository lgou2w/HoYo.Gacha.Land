import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { serveDir } from 'https://deno.land/std@0.224.0/http/file_server.ts'
import * as genshinDict from './utilities/genshin-dict.ts'
import * as release from './utilities/release.ts'

const metadata = JSON.stringify({
  id: 'com.lgou2w.hoyo.gacha',
  name: 'HoYo.Gacha',
  author: 'lgou2w',
  repository: 'https://github.com/lgou2w/HoYo.Gacha',
  poweredBy: 'Deno Deploy'
})

async function handleRequest (req: Request): Promise<Response> {
  const url = new URL(req.url)

  // Genshin Impact dictionary
  let res = genshinDict.handleRequest(req, url.pathname)
  if (res !== false) return res

  // Release
  res = await release.handleRequest(req, url)
  if (res !== false) return res

  // Serve static files from public/ directory
  if (url.pathname.startsWith('/static')) {
    return await serveDir(req, {
      fsRoot: 'public',
      urlRoot: 'static'
    })
  }

  // Else metadata
  return new Response(metadata, {
    headers: {
      'content-type': 'application/json'
    }
  })
}

serve(handleRequest)
