import request from '@/utils/request'

export function statics() {
  return request({
    url: '/dashboard/statics',
    method: 'get'
  })
}
