import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/studio/page',
    method: 'get',
    params: query
  })
}

export function updateStudio(data) {
  return request({
    url: '/studio/update',
    method: 'post',
    data
  })
}

export function importStudios(batchId) {
  return request({
    url: '/studio/importStudios',
    method: 'post',
    params: {
      batchId: batchId
    }
  })
}

