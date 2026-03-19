/**
 * Shared constants for user preferences
 * Used across onboarding and profile editing screens
 */

export const GENDERS = [
  { value: "woman", label: "Woman", icon: "♀" },
  { value: "man", label: "Man", icon: "♂" },
] as const;

export const LOOKING_FOR_OPTIONS = [
  { value: "woman", label: "Women", icon: "♀" },
  { value: "man", label: "Men", icon: "♂" },
  { value: "everyone", label: "Everyone", icon: "💫" },
] as const;

export type gender = (typeof GENDERS)[number]["value"];
export type lookingForOptions = (typeof LOOKING_FOR_OPTIONS)[number]["value"];

/** convert looking for to an array for storage
 * everyone becomes ["man", "woman"]
 */

export const convertLookingForToArray = (
  option: lookingForOptions,
): string[] => {
  if (option === "everyone") {
    return ["man", "woman"];
  }
  return [option];
};

/** Convert stored looking for into a value
 * ['man','woman'] becomes everyone
 */
export const convertLookingForArray = (option: string[]): lookingForOptions => {
  if (
    (option.length == 2 && option.includes("man")) ||
    option.includes("woman")
  ) {
    return "everyone";
  }

  if (option.includes("man")) return "man";
  if (option.includes("woman")) return "woman";

  return "everyone";
};
