export function buildProfilePayload(input) {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    location: input.location,
    summary: input.summary,
    links: {
      linkedin: input.linkedin,
      portfolio: input.portfolio,
      github: input.github,
      website: input.website || input.portfolio
    },
    customFields: input.customFields || [],
    contextOverrides: input.contextOverrides || {}
  };
}
