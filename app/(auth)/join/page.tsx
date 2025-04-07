'use client'
import { join } from '@/app/actions/auth'
import { useActionState } from 'react'
 
export default function Join() {
  const [state, action, pending] = useActionState(join, undefined)
 
  return (
    <form action={action}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Name" defaultValue={ state?.data?.name } />
      </div>
      {state?.errors?.name && <p>{state.errors.name}</p>}
 
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" placeholder="Email" defaultValue={ state?.data?.email } />
      </div>
      {state?.errors?.email && <p>{state.errors.email}</p>}
 
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" defaultValue={ state?.data?.password } />
      </div>
      {state?.errors?.password && (
        <div>
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}
      <a href="/login">Login</a>
      <button disabled={pending} type="submit">Join</button>
    </form>
  )
}