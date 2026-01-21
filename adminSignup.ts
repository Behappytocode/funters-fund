import { supabase } from './supabase.ts';

export async function signupAdmin(email: string, password: string, name: string) {
  // 1. Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error creating admin auth user:", error.message);
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return { success: false, message: "User not created in Auth" };
  }

  const userId = data.user.id;

  // 2. Upsert admin profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    role: 'ADMIN',
    status: 'ACTIVE',
    name: name,
  });

  if (profileError) {
    console.error("Error creating admin profile:", profileError.message);
    return { success: false, message: profileError.message };
  }

  return { success: true, message: "Admin created successfully", userId };
}