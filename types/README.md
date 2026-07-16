# @gimloader/types

These are type definitions for the environment used by Gimloader scripts. They include the global `GL` and `api` variables, and have types available through the `Gimloader` namespace.

## Usage

Install the package with `npm install -D @gimloader/types`. Then, add the following to your tsconfig file.

```json
{
    "compilerOptions": {
        "types": ["@gimloader/types"]
    }
}
```

## Dependencies

This package will install `@types/react`, `@types/react-dom`, and `phaser` for the `api.React`, `api.ReactDOM`, and `api.stores.phaser` variables respectively. It also has an optional peer dependency on `svelte@5.43.0` (exact version), which will give types to `api.Components`.