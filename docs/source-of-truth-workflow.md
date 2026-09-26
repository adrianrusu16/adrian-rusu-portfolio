# Source-of-truth workflow

`main` in `adrianrusu16/adrian-rusu-portfolio` is the canonical source.

ChatGPT Sites is the deployment/hosting surface. The normal GitHub connection in ChatGPT is live read access and does not automatically synchronize a repository into a Site.

## Production update

1. Make changes on a branch.
2. Run `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`.
3. Merge to `main`.
4. Create/export an archive from that exact `main` revision.
5. Update the existing ChatGPT Site using the archive as the new source of truth.
6. Preserve the existing Site identity, custom domain and audience.
7. Preview before publishing.
8. If Sites makes any source edits, export/reconcile them back to Git immediately.

This prevents a later Site edit from reintroducing files from an older internal working copy.
