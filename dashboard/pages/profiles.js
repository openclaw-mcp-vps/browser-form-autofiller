export async function fetchProfiles(baseUrl = "http://localhost:3000") {
  const response = await fetch(`${baseUrl}/api/profiles`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles: ${response.status}`);
  }

  return response.json();
}

export async function saveProfile(baseUrl, profile) {
  const response = await fetch(`${baseUrl}/api/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    throw new Error(`Failed to save profile: ${response.status}`);
  }

  return response.json();
}
