# Firestore Security Specification

## 1. Data Invariants
- Every CV profile (`/users/{userId}/cv_profiles/{profileId}`) must belong to an authenticated user whose UID matches `{userId}` and `incoming().userId`.
- No user can read, list, create, update, or delete another user's CV profiles.
- Document IDs and `id` property must conform to `^[a-zA-Z0-9_-]+$` with length <= 128 chars.
- Profile `name` must be a string between 1 and 100 characters.
- Profile `targetField` must be a string between 1 and 100 characters.
- Profile `text` must be a string with maximum length 20,000 characters.
- Timestamps `createdAt` and `updatedAt` are bounded string representations.
- Global catch-all blocks all unspecified collections.

## 2. Dirty Dozen Payloads (Designed to be REJECTED)
1. **Unauthenticated Read**: Anonymous/unauthenticated request attempting to read `/users/user123/cv_profiles/cv1`. -> `PERMISSION_DENIED`
2. **Cross-Tenant List**: Authenticated user `userABC` attempting to list `/users/userXYZ/cv_profiles`. -> `PERMISSION_DENIED`
3. **Cross-Tenant Write**: Authenticated user `userABC` attempting to create `/users/userXYZ/cv_profiles/cv1` with `userId: 'userXYZ'`. -> `PERMISSION_DENIED`
4. **Identity Spoofing in Body**: Authenticated user `userABC` writing to `/users/userABC/cv_profiles/cv1` with `userId: 'userXYZ'`. -> `PERMISSION_DENIED`
5. **Path ID Mismatch**: Authenticated user writing to `/users/userABC/cv_profiles/profile123` with payload `id: 'profile999'`. -> `PERMISSION_DENIED`
6. **Malicious ID Characters**: Document ID containing path traversal `../admin` or symbols `*&^%$#`. -> `PERMISSION_DENIED`
7. **Shadow Field Injection**: Payload including undeclared field `isAdmin: true` or `role: 'superadmin'`. -> `PERMISSION_DENIED`
8. **Denial-of-Wallet Payload**: Payload with `text` exceeding 20,000 characters. -> `PERMISSION_DENIED`
9. **Oversized Name**: Payload with `name` exceeding 100 characters. -> `PERMISSION_DENIED`
10. **Type Poisoning**: Payload where `isDefault` is a string or number instead of a boolean. -> `PERMISSION_DENIED`
11. **Immutable User ID Mutation**: Attempting an update that modifies `userId` from `userABC` to `userDEF`. -> `PERMISSION_DENIED`
12. **Missing Required Fields**: Attempting to create a profile without `name` or `text`. -> `PERMISSION_DENIED`
