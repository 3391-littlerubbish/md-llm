const list = [
  { id: 1, name: '总公司', parentId: null },
  { id: 2, name: '研发部', parentId: 1 },
  { id: 3, name: '市场部', parentId: 1 },
  { id: 4, name: '前端组', parentId: 2 },
  { id: 5, name: '后端组', parentId: 2 },
  { id: 6, name: '推广组', parentId: 3 },
]

let map = {
  // key1: {
  //
  // },
  // key2: {
  //
  // }
}
const root = []
list.forEach(item => ({ ...item, item.children = [] }))
list.forEach(item => {
  if (item.parentId === null) {
    root.push(map[item.id])
  } else {

  }
})
