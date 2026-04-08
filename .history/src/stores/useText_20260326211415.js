const tree = [
  {
    id: 1, name: '总公司', parentId: null,
    children: [
      {
        id: 2, name: '研发部', parentId: 1,
        children: [
          { id: 4, name: '前端组', parentId: 2, children: [] },
          { id: 5, name: '后端组', parentId: 2, children: [] },
        ]
      },
      {
        id: 3, name: '市场部', parentId: 1,
        children: [
          { id: 6, name: '推广组', parentId: 3, children: [] },
        ]
      }
    ]
  }
]
