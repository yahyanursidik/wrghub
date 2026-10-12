/** Fetch that never treats HTTP failures as successful mutations. */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      const payload = await response.clone().json().catch(() => null);
      const detail = typeof payload?.error === 'string' ? payload.error : payload?.error?.message;
      throw new Error(detail || `Permintaan gagal (${response.status}). Perubahan belum disimpan.`);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tidak bisa terhubung. Coba lagi.';
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('wargahub:request-error', { detail: message }));
    throw error;
  }
}
