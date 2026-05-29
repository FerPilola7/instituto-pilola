"use server";

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

export async function redeemRewardAction(rewardId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // 2. Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "No se pudo obtener tu perfil" };
    }

    if (!profile.is_active) {
      return { success: false, error: "Tu cuenta de alumno está inactiva" };
    }

    // 3. Obtener los detalles del premio
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", rewardId)
      .single();

    if (rewardError || !reward) {
      return { success: false, error: "No se encontró la promoción seleccionada" };
    }

    if (!reward.is_active) {
      return { success: false, error: "Esta promoción ya no está disponible" };
    }

    // 4. Validar puntos suficientes
    if (profile.points < reward.points_cost) {
      return { success: false, error: `Puntos insuficientes. Necesitas ${reward.points_cost} pts (tienes ${profile.points} pts).` };
    }

    // 5. Validar stock
    if (reward.stock !== null && reward.stock <= 0) {
      return { success: false, error: "Esta promoción se ha quedado sin stock disponible." };
    }

    // 6. Ejecutar transacciones de canje con privilegios de Administrador para asegurar consistencia
    const adminSupabase = await createAdminClient();

    // Restar puntos del perfil
    const nextPoints = profile.points - reward.points_cost;
    const { error: updateProfileErr } = await adminSupabase
      .from("profiles")
      .update({ points: nextPoints })
      .eq("id", user.id);

    if (updateProfileErr) throw updateProfileErr;

    // Descontar del stock si aplica
    if (reward.stock !== null) {
      const { error: updateStockErr } = await adminSupabase
        .from("rewards")
        .update({ stock: reward.stock - 1 })
        .eq("id", rewardId);
      
      if (updateStockErr) throw updateStockErr;
    }

    // Crear registro del canje
    const { error: insertRedemptionErr } = await adminSupabase
      .from("reward_redemptions")
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        points_spent: reward.points_cost,
        status: "pendiente"
      });

    if (insertRedemptionErr) throw insertRedemptionErr;

    // Crear historial de puntos
    const { error: insertHistoryErr } = await adminSupabase
      .from("points_history")
      .insert({
        user_id: user.id,
        points: reward.points_cost,
        type: "redeemed",
        concept: `Canje: ${reward.title}`
      });

    if (insertHistoryErr) throw insertHistoryErr;

    // Insertar notificación de canje
    const { error: insertNotificationErr } = await adminSupabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Canje Exitoso 🎉",
        message: `Has canjeado "${reward.title}" por ${reward.points_cost} puntos. Preséntate con tu profesor/administrador para recibir tu premio.`,
        type: "reward"
      });

    if (insertNotificationErr) throw insertNotificationErr;

    return { success: true, newPoints: nextPoints };
  } catch (err: any) {
    console.error("Error in redeemRewardAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al procesar el canje." };
  }
}
