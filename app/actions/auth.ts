import { JoinFormState, LoginFormState, JoinFormSchema, LoginFormSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";

export async function login(state: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    profileId: formData.get('profileId'),
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

  const { email, password, profileId } = validatedFields.data;


  if(profileId && profileId > 0) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'force-cache',
      body: JSON.stringify({
        email,
        password,
        profileId
      })
    })

    const data: {
      result?: boolean;
      message: string;
    } = await res.json()

    if(res.status === 200) {
      return {
        data: {
          email: formData.get('email')?.toString(),
          password: formData.get('password')?.toString()
        },
        message: data.message,
        isLogin: true
      }
    }
  } 

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check/profile`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
    body: JSON.stringify({
      email,
      password
    })
  })

  const data: {
    result?: boolean;
    message: string;
    profiles?: {
      id: number;
      userTag: string;
      userName?: string;
      isCompany: boolean;
      information?: string;
      image: string;
      createdAt: Date;
    }[];
  } = await res.json()

  if(res.status !== 200) {
    return {
      data: {
        email: formData.get('email')?.toString(),
        password: formData.get('password')?.toString()
      },
      message: data.message,
    }
  }

  return {
    data: {
      email: formData.get('email')?.toString(),
      password: formData.get('password')?.toString()
    },
    message: data.message,
    profiles: data.profiles
  } 
}

export async function join(state: JoinFormState, formData: FormData) {
  const validatedFields = JoinFormSchema.safeParse({
    tag: formData.get('tag'),
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  
  if(!validatedFields.success) {
    return {
      data: {
        tag: formData.get('tag')?.toString(),
        name: formData.get('name')?.toString(),
        email: formData.get('email')?.toString(),
        password: formData.get('password')?.toString()
      },
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { tag, name, email, password } = validatedFields.data

  const data: {
    result?: boolean;
    message: string;
  } = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
    body: JSON.stringify({
      tag,
      name,
      email,
      password
    })
  }).then(res => {
    if(res.status === 200) {
      redirect('/login')
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