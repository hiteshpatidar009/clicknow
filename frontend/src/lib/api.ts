const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const { auth = true, headers, ...rest } = options;
  const token = localStorage.getItem("token");

  const mergedHeaders = new Headers(headers || {});
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (!mergedHeaders.has("Content-Type") && rest.body && !isFormData) {
    mergedHeaders.set("Content-Type", "application/json");
  }
  if (auth && token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { response, payload };
}

export function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, String(value));
  });
  return query.toString();
}

export function getPaginationTotal(pagination: any) {
  return pagination?.totalCount ?? pagination?.total ?? 0;
}
