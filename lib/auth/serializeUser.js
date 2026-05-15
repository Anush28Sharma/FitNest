/**
 * Converts a Mongoose user document (or plain object) into a clean,
 * JSON-safe object.  Every API route and getCurrentUser() should use
 * this instead of manually picking fields.
 */
export function serializeUser(user) {
  return {
    id: user._id ?? user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    dateOfBirth: user.dateOfBirth ?? null,
    gender: user.gender ?? null,
    height: user.height ?? null,
    weight: user.weight ?? null,
    age: user.age ?? null, // Virtual property
    healthHistory: user.healthHistory ?? [],
    bmiHistory: user.bmiHistory ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
