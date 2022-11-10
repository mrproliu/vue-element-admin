/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/studios',
  component: Layout,
  redirect: '/studios/page',
  name: 'Table',
  meta: {
    title: '影片',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/studio/list'),
      name: '列表',
      meta: { title: '影片列表' }
    },
    {
      path: 'import',
      component: () => import('@/views/studio/import'),
      name: '导入',
      meta: { title: '导入影片' }
    }
  ]
}
export default tableRouter
