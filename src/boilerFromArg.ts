export default async function boilerFromArg(
  repo: string
): Promise<string> {
  const nameMatch = repo.match(/([^\/.]+)\.*[git]*$/)
  if (!nameMatch) {
    console.error(
      "Argument should be a git repository or `boiler/[name]`."
    )
    process.exit(1)
  }
  const [, name] = nameMatch

  return name
}
