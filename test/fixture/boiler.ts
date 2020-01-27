export function process(
  root: string,
  path: string,
  src: string,
  data: Record<string, any>
): [string, string, Record<string, any>] {
  return [path, src, data]
}
