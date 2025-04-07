import { JoinFormState, LoginFormState, JoinFormSchema, LoginFormSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";

export async function login(state: LoginFormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  
  if(!validatedFields.success) {
    return {
      data: {
        email: formData.get('email')?.toString(),
        password: formData.get('password')?.toString()
      },
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const data: {
    result?: boolean;
    message: string;
  } = await fetch('/api/auth', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
    body: JSON.stringify({
      email,
      password
    })
  }).then((res) => {
    if(res.status) {
      redirect('/')
    }

    return res.json()
  })

  return {
    data: {
      email: formData.get('email')?.toString(),
      password: formData.get('password')?.toString()
    },
    message: data.message
  }
}

export async function join(state: JoinFormState, formData: FormData) {
  const validatedFields = JoinFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  
  if(!validatedFields.success) {
    return {
      data: {
        name: formData.get('name')?.toString(),
        email: formData.get('email')?.toString(),
        password: formData.get('password')?.toString()
      },
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  fetch('/api/auth/user', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
    body: JSON.stringify({
      name,
      email,
      password
    })
  })

}