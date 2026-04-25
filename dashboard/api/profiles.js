export async function getProfiles(baseUrl = "http://localhost:3000") {
  const response = await fetch(`${baseUrl}/api/profiles`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`API /profiles failed: ${response.status}`);
  }

  return response.json();
}
