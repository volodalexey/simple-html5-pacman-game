export function compareArrays (arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false
  }

  arr1 = [...arr1].sort()
  arr2 = [...arr2].sort()

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}
