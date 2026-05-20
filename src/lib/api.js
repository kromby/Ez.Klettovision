const API_KEY = import.meta.env.VITE_API_KEY ?? '';

export function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'X-Api-Key': API_KEY,
      ...options.headers,
    },
  });
}
