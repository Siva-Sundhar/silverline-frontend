// utils/countryCurrency.js
export const COUNTRY_MAP = {
  india:                  { currency: "INR", localeISO: "en-IN" },
  nigeria:                { currency: "NGN", localeISO: "en-NG" },
  "united states":        { currency: "USD", localeISO: "en-US" },
  usa:                    { currency: "USD", localeISO: "en-US" },
  "united kingdom":       { currency: "GBP", localeISO: "en-GB" },
  uk:                     { currency: "GBP", localeISO: "en-GB" },
  "united arab emirates": { currency: "AED", localeISO: "en-AE" },
  uae:                    { currency: "AED", localeISO: "en-AE" },
  kenya:                  { currency: "KES", localeISO: "en-KE" },
  "south africa":         { currency: "ZAR", localeISO: "en-ZA" },
  ghana:                  { currency: "GHS", localeISO: "en-GH" },
  canada:                 { currency: "CAD", localeISO: "en-CA" },
  australia:              { currency: "AUD", localeISO: "en-AU" },
  singapore:              { currency: "SGD", localeISO: "en-SG" },
  germany:                { currency: "EUR", localeISO: "de-DE" },
  france:                 { currency: "EUR", localeISO: "fr-FR" },
};

export const getCountryInfo = (country = "") =>
  COUNTRY_MAP[country.trim().toLowerCase()] || {};