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

// 1. Entregar Recompensa
export async function deliverRedemptionAction(redemptionId: string) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) {
      return { success: false, error: "No autorizado" };
    }

    const adminSupabase = await createAdminClient();

    // Obtener detalles del canje
    const { data: redemption, error: fetchErr } = await adminSupabase
      .from("reward_redemptions")
      .select("*, rewards(*)")
      .eq("id", redemptionId)
      .single();

    if (fetchErr || !redemption) {
      return { success: false, error: "No se encontró el registro de canje." };
    }

    // Actualizar estado del canje
    const { error: updateErr } = await adminSupabase
      .from("reward_redemptions")
      .update({ status: "entregado" })
      .eq("id", redemptionId);

    if (updateErr) throw updateErr;

    // Crear notificación para el alumno
    await adminSupabase.from("notifications").insert({
      user_id: redemption.user_id,
      title: "Premio Entregado 🎁",
      message: `¡Felicidades! Tu premio "${redemption.rewards?.title || "Recompensa"}" ha sido entregado oficialmente.`,
      type: "reward"
    });

    // Registrar en bitácora de administrador
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "deliver_reward",
      target_user_id: redemption.user_id,
      details: { redemption_id: redemptionId, reward_title: redemption.rewards?.title }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in deliverRedemptionAction:", err);
    return { success: false, error: "Ocurrió un error al registrar la entrega." };
  }
}

// 2. Cancelar Canje y Reembolsar Puntos
export async function cancelRedemptionAction(redemptionId: string) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) {
      return { success: false, error: "No autorizado" };
    }

    const adminSupabase = await createAdminClient();

    // Obtener detalles del canje
    const { data: redemption, error: fetchErr } = await adminSupabase
      .from("reward_redemptions")
      .select("*, rewards(*)")
      .eq("id", redemptionId)
      .single();

    if (fetchErr || !redemption) {
      return { success: false, error: "No se encontró el registro de canje." };
    }

    if (redemption.status !== "pendiente") {
      return { success: false, error: "Este canje ya ha sido procesado previamente." };
    }

    // 1. Devolver puntos al alumno
    const { data: profile, error: profileErr } = await adminSupabase
      .from("profiles")
      .select("points")
      .eq("id", redemption.user_id)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "No se pudo acceder al perfil del alumno." };
    }

    const refundedPoints = profile.points + redemption.points_spent;
    const { error: refundErr } = await adminSupabase
      .from("profiles")
      .update({ points: refundedPoints })
      .eq("id", redemption.user_id);

    if (refundErr) throw refundErr;

    // 2. Regresar stock si aplica
    if (redemption.rewards && redemption.rewards.stock !== null) {
      const updatedStock = redemption.rewards.stock + 1;
      await adminSupabase
        .from("rewards")
        .update({ stock: updatedStock })
        .eq("id", redemption.reward_id);
    }

    // 3. Cambiar estatus de canje a cancelado
    const { error: statusErr } = await adminSupabase
      .from("reward_redemptions")
      .update({ status: "cancelado" })
      .eq("id", redemptionId);

    if (statusErr) throw statusErr;

    // 4. Registrar en historial de puntos como abono
    await adminSupabase.from("points_history").insert({
      user_id: redemption.user_id,
      points: redemption.points_spent,
      type: "earned",
      concept: `Reembolso por cancelación de: ${redemption.rewards?.title || "Recompensa"}`
    });

    // 5. Crear notificación
    await adminSupabase.from("notifications").insert({
      user_id: redemption.user_id,
      title: "Canje Cancelado ⚠️",
      message: `Tu canje por "${redemption.rewards?.title || "Recompensa"}" ha sido cancelado. Se han reembolsado ${redemption.points_spent} puntos a tu cuenta.`,
      type: "points"
    });

    // 6. Registrar log administrativo
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "cancel_reward",
      target_user_id: redemption.user_id,
      details: { redemption_id: redemptionId, refunded_points: redemption.points_spent }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in cancelRedemptionAction:", err);
    return { success: false, error: "Ocurrió un error al procesar la cancelación." };
  }
}
