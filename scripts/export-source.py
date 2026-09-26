"""Export portable portfolio source without local state or Sites credentials."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
output = root / "public/portfolio-source.zip"
folders = ["src", "public", "scripts", "docs", ".github", "tests"]
files = ["README.md", "AGENTS.md", "CLAUDE.md", "CONTRIBUTING.md", "package.json",
         "pnpm-lock.yaml", "pnpm-workspace.yaml", "astro.config.mjs", "tsconfig.json",
         "eslint.config.mjs", ".gitignore", ".prettierignore", ".prettierrc.json"]
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    paths = [root / name for name in files]
    for folder in folders:
        paths.extend((root / folder).rglob("*"))
    for path in sorted(set(paths)):
        if path.is_file() and path != output and path.name != "qa-mobile.html":
            archive.write(path, Path("adrian-rusu-portfolio") / path.relative_to(root))
print(f"Exported portable source: {output.name}")
