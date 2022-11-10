import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/want/page',
    method: 'get',
    params: query
  })
}

export function updateStatus(id, status) {
  return request({
    url: '/want/updateStatus',
    method: 'post',
    params: {
      id: id,
      status: status
    }
  })
}
