import type { Airport } from "@/types";

export const AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi International", lat: 28.5562, lon: 77.1, region: "North", tier: 1 },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj Intl.", lat: 19.0896, lon: 72.8656, region: "West", tier: 1 },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International", lat: 13.1986, lon: 77.7066, region: "South", tier: 1 },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International", lat: 17.2403, lon: 78.4294, region: "South", tier: 1 },
  { code: "MAA", city: "Chennai", name: "Chennai International", lat: 12.9941, lon: 80.1709, region: "South", tier: 2 },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose Intl.", lat: 22.6547, lon: 88.4467, region: "East", tier: 2 },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel Intl.", lat: 23.0722, lon: 72.6262, region: "West", tier: 2 },
  { code: "PNQ", city: "Pune", name: "Pune International", lat: 18.5822, lon: 73.9197, region: "West", tier: 2 },
  { code: "GOI", city: "Goa", name: "Dabolim / Manohar Intl.", lat: 15.3808, lon: 73.8314, region: "West", tier: 2 },
  { code: "COK", city: "Kochi", name: "Cochin International", lat: 10.152, lon: 76.4019, region: "South", tier: 2 },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh Intl.", lat: 26.7606, lon: 80.8893, region: "Central", tier: 3 },
  { code: "JAI", city: "Jaipur", name: "Jaipur International", lat: 26.8242, lon: 75.8122, region: "North", tier: 3 },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi Intl.", lat: 26.1063, lon: 91.5858, region: "Northeast", tier: 3 },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan", lat: 25.5912, lon: 85.0879, region: "East", tier: 3 },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik International", lat: 20.2444, lon: 85.8178, region: "East", tier: 3 },
  { code: "IXC", city: "Chandigarh", name: "Shaheed Bhagat Singh Intl.", lat: 30.6735, lon: 76.7885, region: "North", tier: 3 },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam International", lat: 33.9871, lon: 74.7742, region: "North", tier: 3 },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri", lat: 25.4524, lon: 82.8593, region: "Central", tier: 3 },
  { code: "IDR", city: "Indore", name: "Devi Ahilya Bai Holkar", lat: 22.7218, lon: 75.8027, region: "Central", tier: 3 },
  { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International", lat: 8.4821, lon: 76.92, region: "South", tier: 3 },
];

const byCode = new Map(AIRPORTS.map((a) => [a.code, a]));

export function airport(code: string): Airport {
  const found = byCode.get(code);
  if (!found) throw new Error(`Unknown airport code: ${code}`);
  return found;
}
