# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

React Native / Expo shopping list app. Initial v1 scaffold is in place — core types, storage layer, and hook are defined in `src/`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) style for all commits:

```
<type>(<scope>): <short description>
```

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.

Examples:
- `feat(list): add swipe-to-delete gesture`
- `fix(storage): handle empty AsyncStorage read`
- `chore: update expo SDK to 55`

Commits should be **atomic** — one logical change per commit. Dependency installs, bug fixes, and config changes should each be their own commit even when made in the same session.
