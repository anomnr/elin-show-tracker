import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const TARGET_MEMBER = "Celline Thefani";

type ScheduleItem = {
  date: string;
  title: string;
  type: string;
  reference_code?: string;
};

type Member = {
  name: string;
};

type ShowData = {
  tanggal: string;
  tipe: string;
  setlist: string;
  ref_code: string;
};

function convertToWIBDate(dateString: string) {
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  return date.toISOString().split("T")[0];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const scheduleUrl = `https://jkt48.com/api/v1/schedules?lang=id&month=${month}&year=${year}`;

    const scheduleRes = await fetch(scheduleUrl, {
      cache: "no-store",
    });

    if (!scheduleRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data schedule JKT48",
          status: scheduleRes.status,
        },
        { status: 500 }
      );
    }

    const scheduleJson = await scheduleRes.json();

    if (!scheduleJson?.data || !Array.isArray(scheduleJson.data)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format data schedule tidak valid",
          raw: scheduleJson,
        },
        { status: 500 }
      );
    }

    const foundShows: ShowData[] = [];
    let checked = 0;

    for (const item of scheduleJson.data as ScheduleItem[]) {
      const refCode = item.reference_code;

      if (!refCode) continue;
      if (item.type !== "SHOW" && item.type !== "EVENT") continue;

      checked++;

      const detailUrl =
        item.type === "SHOW"
          ? `https://jkt48.com/api/v1/theater-shows/${refCode}?lang=id`
          : `https://jkt48.com/api/v1/events/${refCode}?lang=id`;

      try {
        const detailRes = await fetch(detailUrl, {
          cache: "no-store",
        });

        if (!detailRes.ok) {
          console.log("Detail gagal:", refCode, detailRes.status);
          continue;
        }

        const detailJson = await detailRes.json();

        const members =
          detailJson?.data?.jkt48_member ||
          detailJson?.data?.members ||
          detailJson?.data?.member ||
          [];

        if (!Array.isArray(members)) {
          console.log("Members bukan array:", refCode, members);
          continue;
        }

        const isElinThere = members.some((member: Member) => {
          return member.name?.toLowerCase().includes("celline");
        });

        if (isElinThere) {
          foundShows.push({
            tanggal: convertToWIBDate(item.date),
            tipe: item.type,
            setlist: item.title,
            ref_code: refCode,
          });
        }
      } catch (detailError) {
        console.error("Gagal mengambil detail:", refCode, detailError);
      }

      await sleep(500);
    }

    let added = 0;
    let updated = 0;

    for (const show of foundShows) {
      const existing = await prisma.show.findUnique({
        where: {
          ref_code: show.ref_code,
        },
      });

      await prisma.show.upsert({
        where: {
          ref_code: show.ref_code,
        },
        update: {
          tanggal: new Date(show.tanggal),
          tipe: show.tipe,
          setlist: show.setlist,
          member_name: TARGET_MEMBER,
        },
        create: {
          tanggal: new Date(show.tanggal),
          tipe: show.tipe,
          setlist: show.setlist,
          ref_code: show.ref_code,
          member_name: TARGET_MEMBER,
        },
      });

      if (existing) {
        updated++;
      } else {
        added++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sinkronisasi selesai",
      month,
      year,
      checked,
      found: foundShows.length,
      added,
      updated,
      data: foundShows,
    });
  } catch (error) {
    console.error("Sync error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat sinkronisasi",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}