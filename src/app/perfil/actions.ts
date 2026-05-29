"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateProfileDetailsAction(firstName: string, lastName: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    if (!firstName.trim() || !lastName.trim()) {
      return { success: false, error: "El nombre y apellido no pueden estar vacíos." };
    }

    // Actualizar en base de datos
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Actualizar metadatos en Auth para mantener sincronía
    await supabase.auth.updateUser({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim()
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateProfileDetailsAction:", err);
    return { success: false, error: "Error al actualizar los datos de perfil." };
  }
}

export async function updatePasswordAction(password: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in updatePasswordAction:", err);
    return { success: false, error: "Error al cambiar la contraseña." };
  }
}
