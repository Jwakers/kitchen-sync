export function cleanObject<T>(obj: T extends object ? T : never) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined || value !== null
    )
  );
}
