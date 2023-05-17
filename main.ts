import { serve } from 'https://deno.land/std@0.187.0/http/server.ts'
import { serveDir } from 'https://deno.land/std@0.187.0/http/file_server.ts'
import * as genshinDict from './utilities/genshin-dict.ts'

const metadata = JSON.stringify({
  id: 'com.lgou2w.hoyo.gacha',
  name: 'HoYo.Gacha',
  author: 'lgou2w',
  repository: 'https://github.com/lgou2w/HoYo.Gacha',
  poweredBy: 'Deno Deploy'
})

async function handleRequest (req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname

  // Genshin Impact dictionary
  const res = genshinDict.handleRequest(req, pathname)
  if (res !== false) return res

  // Serve static files from public/ directory
  if (pathname.startsWith('/static')) {
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
