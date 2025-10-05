// src/api/types.ts
export interface Profile {
  name: string
  phone: string
  email?: string | null
  gender?: string | null
  dob?: string | null        // ISO date string (e.g. "1995-04-12")
}
