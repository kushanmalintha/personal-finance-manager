import {
    initialSetupSchema,
    type InitialSetupInput,
    type ValidatedInitialSetup,
} from "./initialSetupSchema";

/**
 * Contract for the operation responsible for saving
 * the complete initial setup atomically.
 *
 * The data layer will provide this operation.
 */
export type SaveInitialSetup = (setup: ValidatedInitialSetup) => Promise<void>;

/**
 * Validate and complete the user's initial setup.
 */
export async function completeInitialSetup(
  input: InitialSetupInput,
  saveInitialSetup: SaveInitialSetup,
): Promise<void> {
  const validatedSetup = initialSetupSchema.parse(input);

  await saveInitialSetup(validatedSetup);
}
