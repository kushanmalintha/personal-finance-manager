// Function contract for signing out the current account.
export type LogoutAccount = () => Promise<void>;

// Coordinate the logout operation through the authentication service.
export async function logoutUser(logoutAccount: LogoutAccount): Promise<void> {
  await logoutAccount();
}
