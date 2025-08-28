export type RequestStatus = 'published' | 'private';

export function formatRequestStatusText(status: RequestStatus): string {
  switch (status) {
    case 'published':
      return '게시됨';
    case 'private':
      return '비공개';
    default:
      return '알 수 없음';
  }
}

export function formatRequestStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'published':
      return '#21B500';
    case 'private':
      return '#6B7280';
    default:
      return '#6B7280';
  }
}


