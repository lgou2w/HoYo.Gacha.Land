import * as path from 'https://deno.land/std@0.224.0/path/mod.ts'

const dictDir = path.join(Deno.cwd(), 'public', 'genshin', 'dict')

type Dict = Array<{
  category: string,
  category_name: string,
  entries: Record<string, [string, number] | [string[], number]>
}>

// name -> id | id[]
type Entries = Record<string, string>
// category -> entries
type Categories = Record<string, Entries>
// lang -> category
const dictMappings: Record<string, Categories> = {}

for await (const file of Deno.readDir(dictDir)) {
  const idx = file.name.lastIndexOf('.')
  if (idx !== -1) {
    const lang = file.name.substring(0, idx)
    const rawData = await Deno.readTextFile(path.join(dictDir, file.name))
    const dict = JSON.parse(rawData) as Dict

    const categories: Categories = {}
    for (const category of dict) {
      const entries: Entries = {}
      for (const entry in category.entries) {
        const [id, _rank] = category.entries[entry]
        entries[entry] = typeof id === 'string' ? id : id[id.length - 1] // last
      }
      categories[category.category] = entries
    }
    dictMappings[lang] = categories
  }
}

const DefaultLang = 'zh-cn'

export function handleRequest (
  req: Request,
  pathname: string
): false | Response {
  const execArray = /^\/static\/genshin(\/(.*))?\/(character|weapon)(\/cutted)?\/(.+)\.png$/.exec(pathname)
  if (!execArray) return false

  const [,, lang = DefaultLang, category, cutted, name] = execArray
  const decodedName = decodeURIComponent(name)
  const identifier = dictMappings[lang]?.[category]?.[decodedName]
  if (!identifier) return false

  return new Response(null, {
    status: 302,
    headers: {
      ...req.headers,
      'location': `/static/genshin/${category}/` + (cutted ? 'cutted/' : '') + `${identifier}.png`
    }
  })
}
