"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!firstName || !lastName || !email || !password) {
    return { error: "Por favor, completa todos los campos" };
  }
  
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const supabase = await createServerSupabaseClient();
  
  // Registrar el usuario en auth.users
  // El trigger de supabase creará automáticamente el profile
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });

  if (error) {
    if (error.status === 422 || error.message.includes("already registered")) {
        return { error: "Este correo ya está registrado." };
    }
    return { error: "Ocurrió un error al registrar la cuenta. Intenta de nuevo." };
  }

  revalidatePath("/", "layout");
  redirect("/inicio");
}
