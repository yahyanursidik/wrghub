import { neonSql } from '../src/db/neon';
import { createClient } from '@libsql/client';
import 'dotenv/config';

async function main() {
  console.log('--- UPDATING TO GRAND SARIWANGI ---');

  if (neonSql) {
    try {
      // 1. Update communities
      await neonSql`
        UPDATE communities 
        SET name = 'Komplek Grand Sariwangi', 
            address = 'Grand Sariwangi, Sariwangi, Bandung Barat',
            city = 'Bandung Barat',
            postal_code = '40559'
        WHERE id = 'comm-01' OR code LIKE '%SEJAHTERA%';
      `;
      console.log('✓ Communities updated in Neon');

      // 2. Update settings community_name
      await neonSql`
        UPDATE settings 
        SET value = 'Komplek Grand Sariwangi'
        WHERE key = 'community_name';
      `;
      console.log('✓ settings community_name updated in Neon');

      // 3. Update settings community_profile
      const existingProfile = await neonSql`SELECT value FROM settings WHERE key = 'community_profile'`;
      if (existingProfile.length > 0) {
        try {
          const p = JSON.parse(existingProfile[0].value);
          p.communityName = 'Komplek Grand Sariwangi';
          p.address = 'Grand Sariwangi, Sariwangi, Bandung Barat';
          await neonSql`UPDATE settings SET value = ${JSON.stringify(p)} WHERE key = 'community_profile'`;
          console.log('✓ community_profile updated in Neon');
        } catch (e) {}
      }

      // 4. Update any properties with old address
      await neonSql`
        UPDATE properties
        SET address = 'Grand Sariwangi, Kavling M'
        WHERE id = 'prop-kav-m';
      `;

      // 5. Update blocks
      await neonSql`
        UPDATE blocks
        SET name = 'Grand Sariwangi'
        WHERE id = 'blk-kavling';
      `;
      console.log('✓ Block name updated to Grand Sariwangi in Neon');
    } catch (e) {
      console.error('Neon update error:', e);
    }
  }

  // SQLite update
  try {
    const sqlite = createClient({ url: 'file:data/wargahub.db' });
    await sqlite.execute("UPDATE communities SET name = 'Komplek Grand Sariwangi', address = 'Grand Sariwangi, Sariwangi, Bandung Barat' WHERE id = 'comm-01'");
    await sqlite.execute("UPDATE settings SET value = 'Komplek Grand Sariwangi' WHERE key = 'community_name'");
    await sqlite.execute("UPDATE blocks SET name = 'Grand Sariwangi' WHERE id = 'blk-kavling'");
    console.log('✓ SQLite database updated to Komplek Grand Sariwangi');
  } catch (e: any) {
    console.warn('SQLite update note:', e.message);
  }
}

main().catch(console.error);
