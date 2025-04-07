'use client'
import { login } from '@/app/actions/auth'
import { useActionState } from 'react'
 
export default function Login() {
  const [state, action, pending] = useActionState(login, undefined)
  
  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" defaultValue={ state?.data?.email } />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" defaultValue={ state?.data?.password } />
      </div>
      {state?.message && <p>{state.message}</p>}
      <a href="/join">Join</a>
      <button disabled={pending} type="submit">Login</button>
    </form>
  )
}