export function withAdminToast(path: string, message: string, type: 'success' | 'error' = 'success') {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}toast=${encodeURIComponent(message)}&toastType=${type}`;
}
