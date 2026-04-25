export async function mapFields(baseUrl, body) {
  const response = await fetch(`${baseUrl}/api/context`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Context mapping failed: ${response.status}`);
  }

  return response.json();
}
