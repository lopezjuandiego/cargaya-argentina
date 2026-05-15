import { getDb } from "@/lib/db";
import { AdminLogout, SubmissionList } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sql = getDb();

  const [pending, stats, feedbacks] = await Promise.all([
    sql`
      SELECT id, name, operator, address, city, province, lat, lng,
             "connectorTypes", "powerKw", comment, "submittedAt"
      FROM "UserSubmission"
      WHERE status = 'pending'
      ORDER BY "submittedAt" DESC
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::int   AS pending,
        COUNT(*) FILTER (WHERE status = 'approved')::int  AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::int  AS rejected
      FROM "UserSubmission"
    `,
    sql`
      SELECT id, type, message, email, page, "createdAt"
      FROM "Feedback"
      ORDER BY "createdAt" DESC
      LIMIT 20
    `,
  ]);

  const { pending: nPending, approved: nApproved, rejected: nRejected } = stats[0] as {
    pending: number; approved: number; rejected: number;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-xs text-gray-400">DóndeCargar · Estaciones enviadas por usuarios</p>
        </div>
        <AdminLogout />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Pendientes", value: nPending, color: "text-amber-600" },
          { label: "Aprobadas", value: nApproved, color: "text-green-600" },
          { label: "Rechazadas", value: nRejected, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending submissions */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Pendientes de revisión
      </h2>
      <SubmissionList submissions={pending as Parameters<typeof SubmissionList>[0]["submissions"]} />

      {/* Feedbacks */}
      {(feedbacks as { id: number; type: string; message: string; email: string | null; page: string | null; createdAt: string }[]).length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-8">
            Feedback reciente
          </h2>
          <div className="space-y-3">
            {(feedbacks as { id: number; type: string; message: string; email: string | null; page: string | null; createdAt: string }[]).map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f.type}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(f.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-snug">{f.message}</p>
                {f.email && <p className="text-xs text-gray-400">{f.email}</p>}
                {f.page && <p className="text-xs text-gray-300">Página: {f.page}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <a href="/" className="text-sm text-gray-400 hover:text-green-600">← Volver al sitio</a>
      </div>
    </div>
  );
}
