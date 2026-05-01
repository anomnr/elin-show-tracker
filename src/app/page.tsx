import prisma from "@/lib/prisma";
import SyncButton from "@/components/Syncbutton";
import Image from "next/image";

type Show = {
  id: number;
  tanggal: Date;
  tipe: string;
  setlist: string;
  ref_code: string;
  member_name: string;
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatShortDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export default async function Home() {
  const shows: Show[] = await prisma.show.findMany({
    orderBy: {
      tanggal: "desc",
    },
  });

  const totalShows = shows.length;
  const totalTheater = shows.filter((show) => show.tipe === "SHOW").length;
  const totalEvent = shows.filter((show) => show.tipe === "EVENT").length;

  const latestShow = shows[0];

  return (
    <main className="min-h-screen bg-[#0b0b12] text-white">
      <section className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-cyan-400/10 p-6 shadow-2xl md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <Image
                src="/images/celline_thefani.jpg"
                alt="Elin"
                width={112}
                height={112}
                className="h-24 w-24 rounded-2xl object-cover shadow-xl md:h-28 md:w-28"
              />

              <div>
                <p className="mb-2 inline-flex rounded-full border border-pink-300/30 bg-pink-400/10 px-3 py-1 text-xs text-pink-200">
                  Elin Show Tracker
                </p>

                <h1 className="text-3xl font-black md:text-5xl">
                  Celline Thefani
                </h1>

                <p className="mt-2 text-sm text-white/70">
                  Tracker jadwal theater dan event Elin dari JKT48
                </p>
              </div>
            </div>
            <SyncButton/>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-white/50">Total Jadwal</p>
            <p className="mt-2 text-3xl font-black">{totalShows}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-white/50">Theater Show</p>
            <p className="mt-2 text-3xl font-black">{totalTheater}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-white/50">Event</p>
            <p className="mt-2 text-3xl font-black">{totalEvent}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm text-white/50">Terbaru</p>
            <p className="mt-2 truncate text-lg font-bold">
              {latestShow ? latestShow.setlist : "-"}
            </p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Riwayat Penampilan</h2>
            <p className="mt-1 text-sm text-white/50">
              Semua data yang sudah tersimpan di database.
            </p>
          </div>
        </div>

        {shows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/[0.04] p-10 text-center">
            <p className="text-lg font-bold">Belum ada data</p>
            <p className="mt-2 text-sm text-white/50">
              Klik tombol Sync Sekarang untuk mengambil jadwal terbaru.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shows.map((show) => (
              <article
                key={show.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09] hover:shadow-2xl"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 text-center shadow-lg">
                      <span className="text-xs font-bold uppercase">
                        {formatShortDate(show.tanggal).split(" ")[1]}
                      </span>
                      <span className="text-2xl font-black">
                        {formatShortDate(show.tanggal).split(" ")[0]}
                      </span>
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            show.tipe === "SHOW"
                              ? "bg-pink-400/15 text-pink-200"
                              : "bg-cyan-400/15 text-cyan-200"
                          }`}
                        >
                          {show.tipe}
                        </span>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                          {show.ref_code}
                        </span>
                      </div>

                      <h3 className="text-xl font-black">{show.setlist}</h3>

                      <p className="mt-1 text-sm text-white/50">
                        {formatDate(show.tanggal)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/50">
                    {show.member_name}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}