# Fixes for 500 Errors

## Changes Applied

1) Explicit entity table names to avoid default naming conflicts.
   - `apps/auth/src/user/user.entity.ts`: `@Entity('user')`, `@Entity('role')`

2) Adjusted ManyToMany settings to avoid persistence errors.
   - `apps/auth/src/user/user.entity.ts`: set `cascade: false`, added a join table name

3) Removed redundant reload in registration flow.
   - `apps/auth/src/auth/auth.service.ts`: roles are eager-loaded, no second query needed

## Follow-up

- Rebuild: `npm run build`
- Restart services: `powershell -ExecutionPolicy Bypass -File run-all-services.ps1`
- Re-run API checks: `node test-apis.js`

## Notes

- If you see duplicate `user/users` or `role/roles` tables, drop the unused ones or align naming across services.
- If using a pooler connection string, consider tuning the pool settings for local dev.
