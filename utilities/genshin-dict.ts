import * as path from 'https://deno.land/std@0.187.0/path/mod.ts'

const dictDir = path.join(Deno.cwd(), 'public', 'genshin', 'dict')

// Load index.json
const indexFile = path.join(dictDir, 'index.json')
const indexFileData = await Deno.readTextFile(indexFile)
const mappings = JSON.parse(indexFileData) as Record<string, Record<string, string>>

/*
// FIXME: Deprecated, as official resources are no longer used.
//
// // Load ids.json
// const idsFile = path.join(dictDir, 'ids.json')
// const idsFileData = await Deno.readTextFile(idsFile)
// const ids = JSON.parse(idsFileData) as Record<string, string>

// // Category -> miHoYo Category
// const categoryMappings: Record<string, string> = {
//   character: 'character_icon',
//   weapon: 'equip'
// }
//
// https://upload-bbs.mihoyo.com/game_record/genshin/${miHoYoCategory}/${idToName}.png
//
*/

export function handleRequest (
  req: Request,
  pathname: string
): false | Response {
  const execArray = /^\/static\/genshin\/(character|weapon)\/(.+)\.png$/.exec(pathname)
  if (!execArray) return false

  const [, category, name] = execArray
  const decodedName = decodeURIComponent(name)
  const identifier = mappings[category]?.[decodedName]
  if (!identifier) return false

  return new Response(null, {
    status: 302,
    headers: {
      ...req.headers,
      'location': `/static/genshin/${category}/${identifier}.png`
    }
  })
}
