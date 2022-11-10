/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/want',
  component: Layout,
  redirect: '/wants/list',
  name: 'Table',
  meta: {
    title: '求片',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/want/list'),
      name: '列表',
      meta: { title: '求片列表' }
    }
  ]
}
export default tableRouter
