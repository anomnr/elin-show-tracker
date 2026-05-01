import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: "file:./dev.db",
  }),
});

async function main() {
  await prisma.show.create({
    data: {
      tanggal: new Date("2025-12-01"),
      tipe: "SHOW",
      setlist: "Pajama Drive",
      ref_code: "test001",
      member_name: "Elin",
    },
  });

  console.log("Data inserted");
}

main();