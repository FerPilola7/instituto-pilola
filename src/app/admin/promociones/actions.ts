"use server";

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

// Helper para verificar rol de administrador
async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) return { isAdmin: false, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: profile?.role === "admin",
    user
  };
}

// 1. Crear Premio
export async function createRewardAction(
  title: string,
  description: string,
  pointsCost: number,
  stock: number | null,
  isActive: boolean
) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) return { success: false, error: "No autorizado" };

    if (!title.trim() || !description.trim()) {
      return { success: false, error: "El título y la descripción son campos obligatorios." };
    }

    if (pointsCost <= 0) {
      return { success: false, error: "El costo en puntos debe ser mayor a cero." };
    }

    const adminSupabase = await createAdminClient();

    const { error: insertErr } = await adminSupabase
      .from("rewards")
      .insert({
        title: title.trim(),
        description: description.trim(),
        points_cost: pointsCost,
        stock: stock,
        is_active: isActive
      });

    if (insertErr) throw insertErr;

    // Log admin log
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "create_reward",
      details: { title: title.trim(), points_cost: pointsCost, stock }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in createRewardAction:", err);
    return { success: false, error: "Error al crear la recompensa." };
  }
}

// 2. Modificar Premio
export async function updateRewardAction(
  id: string,
  title: string,
  description: string,
  pointsCost: number,
  stock: number | null,
  isActive: boolean
) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) return { success: false, error: "No autorizado" };

    if (!title.trim() || !description.trim()) {
      return { success: false, error: "El título y la descripción son obligatorios." };
    }

    if (pointsCost <= 0) {
      return { success: false, error: "El costo en puntos debe ser mayor a cero." };
    }

    const adminSupabase = await createAdminClient();

    const { error: updateErr } = await adminSupabase
      .from("rewards")
      .update({
        title: title.trim(),
        description: description.trim(),
        points_cost: pointsCost,
        stock: stock,
        is_active: isActive
      })
      .eq("id", id);

    if (updateErr) throw updateErr;

    // Log admin log
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "update_reward",
      details: { reward_id: id, title: title.trim(), points_cost: pointsCost, stock, is_active: isActive }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateRewardAction:", err);
    return { success: false, error: "Error al modificar la recompensa." };
  }
}

// 3. Eliminar Premio
export async function deleteRewardAction(id: string) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) return { success: false, error: "No autorizado" };

    const adminSupabase = await createAdminClient();

    const { error: deleteErr } = await adminSupabase
      .from("rewards")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return { success: false, error: "No se puede eliminar este premio porque ya tiene registros de canje asociados. Es mejor desactivarlo." };
    }

    // Log admin log
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "delete_reward",
      details: { reward_id: id }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteRewardAction:", err);
    return { success: false, error: "Error al eliminar la recompensa." };
  }
}
