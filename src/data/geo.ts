import type { Opt } from '../lib/types';

const toOpts = (list: string[]): Opt[] => list.map((v) => ({ value: v, label: v }));

export const COUNTRIES = [
  'India', 'United Arab Emirates', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'New Zealand', 'Germany', 'France', 'Netherlands', 'Ireland',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Greece', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Rwanda', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];
export const COUNTRY_OPTS = toOpts(COUNTRIES);

export const INDIA_CITIES: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool', 'Rajahmundry', 'Kakinada'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  Assam: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Nagaon'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Anand', 'Vapi'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Manali'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Davanagere', 'Ballari', 'Udupi'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Palakkad'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  Maharashtra: ['Mumbai', 'Pune', 'Navi Mumbai', 'Thane', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Panvel', 'Kalyan'],
  Manipur: ['Imphal', 'Thoubal', 'Churachandpur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai'],
  Mizoram: ['Aizawl', 'Lunglei'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali', 'Bathinda'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara'],
  Sikkim: ['Gangtok', 'Namchi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Vellore', 'Hosur', 'Tirunelveli'],
  Telangana: ['Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
  Tripura: ['Agartala', 'Udaipur (Tripura)', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Greater Noida', 'Ghaziabad', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Gorakhpur'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Haldwani', 'Rishikesh', 'Roorkee', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  Chandigarh: ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  Delhi: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti'],
  Puducherry: ['Puducherry', 'Karaikal'],
};

export const INDIA_STATES = Object.keys(INDIA_CITIES);
export const INDIA_STATE_OPTS = toOpts(INDIA_STATES);

/** Cities for the given states, or every listed Indian city when none are chosen. */
export function indiaCityOpts(states?: string[] | string): Opt[] {
  const list = (Array.isArray(states) ? states : states ? [states] : []).filter((s) => INDIA_CITIES[s]);
  const source = list.length ? list : INDIA_STATES;
  return source.flatMap((s) => INDIA_CITIES[s].map((c) => ({ value: c, label: c, description: s })));
}

export const REGIONS: Opt[] = toOpts([
  'Middle East / GCC', 'North America', 'United Kingdom & Ireland', 'Europe', 'Australia & New Zealand', 'South-East Asia', 'East Asia', 'Africa', 'South Asia (SAARC)', 'Latin America',
]);

export const DIAL_CODES: Opt[] = [
  ['+91', 'India'], ['+971', 'UAE'], ['+1', 'US / Canada'], ['+44', 'UK'], ['+61', 'Australia'], ['+65', 'Singapore'], ['+966', 'Saudi Arabia'], ['+974', 'Qatar'], ['+968', 'Oman'], ['+965', 'Kuwait'], ['+973', 'Bahrain'], ['+64', 'New Zealand'], ['+49', 'Germany'], ['+33', 'France'], ['+31', 'Netherlands'], ['+353', 'Ireland'], ['+60', 'Malaysia'], ['+977', 'Nepal'], ['+880', 'Bangladesh'], ['+94', 'Sri Lanka'], ['+27', 'South Africa'], ['+254', 'Kenya'], ['+81', 'Japan'], ['+86', 'China'], ['+852', 'Hong Kong'],
].map(([value, label]) => ({ value, label: `${value}`, description: label }));
