export const complaintStatuses = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export type ComplaintStatus = typeof complaintStatuses[number];

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  REPORTED: 'Dilaporkan',
  ACKNOWLEDGED: 'Diterima',
  IN_PROGRESS: 'Ditangani',
  RESOLVED: 'Selesai',
  CLOSED: 'Ditutup',
};

export const complaintTransitions: Record<ComplaintStatus, readonly ComplaintStatus[]> = {
  REPORTED: ['ACKNOWLEDGED', 'IN_PROGRESS'],
  ACKNOWLEDGED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export const complaintIsOpen = (status: string) => status !== 'RESOLVED' && status !== 'CLOSED';
export const complaintStatusLabel = (status: string) => Object.hasOwn(complaintStatusLabels, status) ? complaintStatusLabels[status as ComplaintStatus] : 'Status tidak dikenal';
