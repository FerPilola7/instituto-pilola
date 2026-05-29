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

// 1. Ajuste Manual de Puntos (Sumar o Restar)
export async function adjustPointsAction(
  studentId: string,
  points: number,
  type: "earned" | "redeemed",
  concept: string
) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) {
      return { success: false, error: "No autorizado" };
    }

    if (points <= 0) {
      return { success: false, error: "La cantidad de puntos debe ser mayor a cero." };
    }

    if (!concept.trim()) {
      return { success: false, error: "Debes especificar un concepto para el ajuste." };
    }

    const adminSupabase = await createAdminClient();

    // Obtener puntos actuales del alumno
    const { data: profile, error: profileErr } = await adminSupabase
      .from("profiles")
      .select("points, first_name, last_name")
      .eq("id", studentId)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "No se encontró el alumno seleccionado." };
    }

    let nextPoints = profile.points;
    if (type === "earned") {
      nextPoints += points;
    } else {
      if (profile.points < points) {
        return { success: false, error: `Puntos insuficientes. El alumno solo tiene ${profile.points} pts.` };
      }
      nextPoints -= points;
    }

    // Actualizar puntos del alumno
    const { error: updateErr } = await adminSupabase
      .from("profiles")
      .update({ points: nextPoints })
      .eq("id", studentId);

    if (updateErr) throw updateErr;

    // Crear registro en historial de puntos
    const { error: historyErr } = await adminSupabase.from("points_history").insert({
      user_id: studentId,
      points: points,
      type: type,
      concept: concept.trim(),
      assigned_by: user.id
    });

    if (historyErr) throw historyErr;

    // Notificación al alumno
    const title = type === "earned" ? "¡Puntos Recibidos! 🎁" : "Puntos Utilizados 💸";
    const message = type === "earned"
      ? `Se te han otorgado ${points} puntos. Concepto: ${concept.trim()}`
      : `Se han deducido ${points} puntos de tu saldo. Concepto: ${concept.trim()}`;

    await adminSupabase.from("notifications").insert({
      user_id: studentId,
      title: title,
      message: message,
      type: "points"
    });

    // Registrar en logs del administrador
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: type === "earned" ? "admin_add_points" : "admin_deduct_points",
      target_user_id: studentId,
      details: { points, type, concept: concept.trim(), nextPoints }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in adjustPointsAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al ajustar los puntos." };
  }
}

// 2. Activar / Desactivar Alumno
export async function toggleStudentStatusAction(studentId: string, isActive: boolean) {
  try {
    const { isAdmin, user } = await verifyAdmin();
    if (!isAdmin || !user) {
      return { success: false, error: "No autorizado" };
    }

    const adminSupabase = await createAdminClient();

    // Actualizar estado del alumno
    const { error: updateErr } = await adminSupabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", studentId);

    if (updateErr) throw updateErr;

    // Registrar en bitácora
    await adminSupabase.from("admin_logs").insert({
      admin_id: user.id,
      action: isActive ? "activate_student" : "deactivate_student",
      target_user_id: studentId,
      details: { is_active: isActive }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in toggleStudentStatusAction:", err);
    return { success: false, error: "Error al cambiar el estatus del alumno." };
  }
}
