export async function syncContext(baseUrl, payload, syncToken) {
  const response = await fetch(`${baseUrl}/api/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(syncToken ? { "x-sync-token": syncToken } : {})
    },
    body: JSON.stringify(payload),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`API /sync failed: ${response.status}`);
  }

  return response.json();
}
