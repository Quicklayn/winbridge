# GitHub Setup

The current tool session can prepare a GitHub-ready repository, but it does not expose a GitHub repository creation operation and `gh` is not installed locally.

## Option A: Create with GitHub CLI

Install GitHub CLI, then run:

```powershell
gh auth login
gh repo create winbridge --private --source . --remote origin --push
```

For a public repository, replace `--private` with `--public`.

## Option B: Create in GitHub UI

1. Create an empty repository named `winbridge`.
2. Do not initialize it with README, license, or gitignore.
3. Add the remote locally:

```powershell
git remote add origin https://github.com/<owner>/winbridge.git
git branch -M main
git push -u origin main
```

## Initial GitHub Project Setup

After the remote exists:

- Confirm Actions are enabled.
- Add branch protection for `main`.
- Require CI before merge.
- Enable private vulnerability reporting if available.
- Create labels:
  - `area:protocol`
  - `area:relay`
  - `area:windows`
  - `area:security`
  - `area:openspec`
  - `type:bug`
  - `type:feature`
  - `type:security`

## Suggested Initial Issues

1. Define identity and device pairing model.
2. Design host consent and visible session UX.
3. Choose Windows native stack.
4. Add WebRTC signaling and media transport.
5. Add audit persistence.
6. Add Windows capture adapter.
7. Add Windows input adapter with revocation tests.
