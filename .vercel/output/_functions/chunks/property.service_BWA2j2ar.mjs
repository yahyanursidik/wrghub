import { t as neonSql } from "./neon_DiYtP58s.mjs";
import { _ as propertyOwnerships, g as properties, h as persons, o as blocks, t as db } from "./db_-Bx7JBvv.mjs";
import { eq } from "drizzle-orm";
//#region src/services/property.service.ts
async function getProperties() {
	try {
		if (process.env.DATABASE_URL) return (await neonSql`
        SELECT 
          p.id, p.code, p.number, p.address, p.occupancy_status, p.is_active, p.notes,
          b.name as block_name, b.code as block_code,
          COALESCE(per.name, 'Warga') as owner_name
        FROM properties p
        LEFT JOIN blocks b ON p.block_id = b.id
        LEFT JOIN property_ownerships po ON p.id = po.property_id AND po.is_active = true
        LEFT JOIN persons per ON po.person_id = per.id
        ORDER BY p.code ASC
      `).map((r) => ({
			id: r.id,
			code: r.code,
			blockCode: r.block_code || r.code.split("-")[0] || "",
			blockName: r.block_name || `Blok ${r.code.split("-")[0]}`,
			number: r.number,
			address: r.address,
			occupancyStatus: r.occupancy_status,
			isActive: Boolean(r.is_active),
			notes: r.notes,
			ownerName: r.occupancy_status === "VACANT" ? "Belum berpenghuni" : r.owner_name
		}));
	} catch (err) {
		console.warn("Falling back to local db:", err);
	}
	const props = await db.select().from(properties).orderBy(properties.code);
	const blocks$1 = await db.select().from(blocks);
	const blockMap = new Map(blocks$1.map((b) => [b.id, b]));
	const persons$1 = await db.select().from(persons);
	const personMap = new Map(persons$1.map((p) => [p.id, p]));
	const ownerships = await db.select().from(propertyOwnerships).where(eq(propertyOwnerships.isActive, true));
	const ownerMap = new Map(ownerships.map((o) => [o.propertyId, personMap.get(o.personId ?? "")?.name]));
	return props.map((p) => {
		const blk = p.blockId ? blockMap.get(p.blockId) : null;
		return {
			id: p.id,
			code: p.code,
			blockCode: blk?.code || p.code.split("-")[0] || "",
			blockName: blk?.name || `Blok ${p.code.split("-")[0]}`,
			number: p.number,
			address: p.address,
			occupancyStatus: p.occupancyStatus,
			isActive: Boolean(p.isActive),
			notes: p.notes,
			ownerName: ownerMap.get(p.id) || (p.occupancyStatus === "VACANT" ? "Belum berpenghuni" : "Warga")
		};
	});
}
async function getPropertyStats() {
	if (process.env.DATABASE_URL) try {
		const stats = await neonSql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN occupancy_status != 'VACANT' THEN 1 END) as occupied,
          COUNT(CASE WHEN occupancy_status = 'VACANT' THEN 1 END) as vacant
        FROM properties
      `;
		const total = Number(stats[0].total) || 120;
		const occupied = Number(stats[0].occupied) || 98;
		const vacant = Number(stats[0].vacant) || 22;
		return {
			total,
			occupied,
			vacant,
			occupiedPercentage: total > 0 ? (occupied / total * 100).toFixed(1) : "81.7",
			vacantPercentage: total > 0 ? (vacant / total * 100).toFixed(1) : "18.3"
		};
	} catch (e) {
		console.warn("Neon stats error:", e);
	}
	const all = await db.select().from(properties);
	const total = all.length || 120;
	const occupied = all.filter((p) => p.occupancyStatus !== "VACANT").length || 98;
	const vacant = all.filter((p) => p.occupancyStatus === "VACANT").length || 22;
	return {
		total,
		occupied,
		vacant,
		occupiedPercentage: total > 0 ? (occupied / total * 100).toFixed(1) : "81.7",
		vacantPercentage: total > 0 ? (vacant / total * 100).toFixed(1) : "18.3"
	};
}
//#endregion
export { getPropertyStats as n, getProperties as t };
