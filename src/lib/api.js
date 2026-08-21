export function authHeaders(json = true) {
  const headers = {
    authorization: `Bearer ${sessionStorage.getItem("token")}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export async function api(path, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(!isFormData && options.body !== undefined),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || "Request failed");
  return data;
}
