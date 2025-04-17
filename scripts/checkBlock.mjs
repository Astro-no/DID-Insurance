// checkBlock.mjs
import { config } from 'dotenv';
import { JsonRpcProvider } from 'ethers';

config(); // Load environment variables from .env

const provider = new JsonRpcProvider(process.env.RPC_URL);

try {
  const block = await provider.getBlock("latest");
  console.log("Latest block:", block);
} catch (err) {
  console.error("Error fetching block:", err);
}
