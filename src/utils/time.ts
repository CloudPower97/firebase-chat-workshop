import dayjs from 'dayjs';

export const formatTimestamp = (timestamp: number | Date | { toDate: () => Date }): string => {
  if (typeof timestamp === 'number') {
    return dayjs(timestamp).format('HH:mm:ss');
  }
  if (timestamp instanceof Date) {
    return dayjs(timestamp).format('HH:mm:ss');
  }
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return dayjs(timestamp.toDate()).format('HH:mm:ss');
  }
  return 'Invalid Time';
};
