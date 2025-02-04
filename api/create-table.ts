import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
 
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const result =
      await sql`CREATE TABLE Cabinets (productionRequest varchar(255), productDesignation varchar(255), technicalIndex varchar(255) );`;
    return response.status(200).json({ result });
  } catch (error) {
    return response.status(500).json({ error });
  }
}