// Base Oficial SENATRAN de Faixas por Estado no Brasil (203 faixas)
(function() {
  const faixas = [
  {
    "de": "AAA",
    "ate": "BEZ",
    "estado": "Paraná",
    "uf": "PR",
    "detran": "https://www.detran.pr.gov.br/"
  },
  {
    "de": "BFA",
    "ate": "GKI",
    "estado": "São Paulo",
    "uf": "SP",
    "detran": "https://www.detran.sp.gov.br/"
  },
  {
    "de": "GKJ",
    "ate": "HOK",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "HOL",
    "ate": "HQE",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "HQF",
    "ate": "HTW",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "HTX",
    "ate": "HZA",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "HZB",
    "ate": "IAP",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "IAQ",
    "ate": "JDO",
    "estado": "Rio Grande do Sul",
    "uf": "RS",
    "detran": "https://www.detran.rs.gov.br/"
  },
  {
    "de": "JDP",
    "ate": "JKR",
    "estado": "Distrito Federal",
    "uf": "DF",
    "detran": "https://www.detran.df.gov.br/"
  },
  {
    "de": "JKS",
    "ate": "JSZ",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "JTA",
    "ate": "JWE",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "JWF",
    "ate": "JXY",
    "estado": "Amazonas",
    "uf": "AM",
    "detran": "https://www.detran.am.gov.br/"
  },
  {
    "de": "JXZ",
    "ate": "KAU",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "KAV",
    "ate": "KFC",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "KFD",
    "ate": "KME",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "KMF",
    "ate": "LVE",
    "estado": "Rio de Janeiro",
    "uf": "RJ",
    "detran": "https://www.detran.rj.gov.br/"
  },
  {
    "de": "LVF",
    "ate": "LWQ",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "LWR",
    "ate": "MMM",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "MMN",
    "ate": "MOW",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "MOX",
    "ate": "MTZ",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "MUA",
    "ate": "MVK",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "MVL",
    "ate": "MXG",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "MXH",
    "ate": "MZM",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "MZN",
    "ate": "NAG",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "NAH",
    "ate": "NBA",
    "estado": "Roraima",
    "uf": "RR",
    "detran": "https://www.detran.rr.gov.br/"
  },
  {
    "de": "NBB",
    "ate": "NEH",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "NEI",
    "ate": "NFB",
    "estado": "Amapá",
    "uf": "AP",
    "detran": "https://www.detran.ap.gov.br/"
  },
  {
    "de": "NFC",
    "ate": "NGZ",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "NHA",
    "ate": "NHT",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "NHU",
    "ate": "NIX",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "NIY",
    "ate": "NJW",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "NJX",
    "ate": "NLU",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "NLV",
    "ate": "NMO",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "NMP",
    "ate": "NNI",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "NNJ",
    "ate": "NOH",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "NOI",
    "ate": "NPB",
    "estado": "Amazonas",
    "uf": "AM",
    "detran": "https://www.detran.am.gov.br/"
  },
  {
    "de": "NPC",
    "ate": "NPQ",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "NPR",
    "ate": "NQK",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "NQL",
    "ate": "NRE",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "NRF",
    "ate": "NSD",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "NSE",
    "ate": "NTC",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "NTD",
    "ate": "NTW",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "NTX",
    "ate": "NUG",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "NUH",
    "ate": "NUL",
    "estado": "Roraima",
    "uf": "RR",
    "detran": "https://www.detran.rr.gov.br/"
  },
  {
    "de": "NUM",
    "ate": "NVF",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "NVG",
    "ate": "NVN",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "NVO",
    "ate": "NWR",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "NWS",
    "ate": "NXQ",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "NXR",
    "ate": "NXT",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "NXU",
    "ate": "NXW",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "NXX",
    "ate": "NYG",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "NYH",
    "ate": "NZZ",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "OAA",
    "ate": "OAO",
    "estado": "Amazonas",
    "uf": "AM",
    "detran": "https://www.detran.am.gov.br/"
  },
  {
    "de": "OAP",
    "ate": "OBS",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "OBT",
    "ate": "OCA",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "OCB",
    "ate": "OCU",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "OCV",
    "ate": "ODT",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "ODU",
    "ate": "OEI",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "OEJ",
    "ate": "OES",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "OET",
    "ate": "OFH",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "OFI",
    "ate": "OFW",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "OFX",
    "ate": "OGG",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "OGH",
    "ate": "OHA",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "OHB",
    "ate": "OHK",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "OHL",
    "ate": "OHW",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "OHX",
    "ate": "OIQ",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "OIR",
    "ate": "OJQ",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "OJR",
    "ate": "OKC",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "OKD",
    "ate": "OKH",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "OKI",
    "ate": "OLG",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "OLH",
    "ate": "OLN",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "OLO",
    "ate": "OMH",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "OMI",
    "ate": "OOF",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "OOG",
    "ate": "OOU",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "OOV",
    "ate": "ORC",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "ORD",
    "ate": "ORM",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "ORN",
    "ate": "OSV",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "OSW",
    "ate": "OTZ",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "OUA",
    "ate": "OUE",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "OUF",
    "ate": "OVD",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "OVE",
    "ate": "OVF",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "OVG",
    "ate": "OVG",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "OVH",
    "ate": "OVL",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "OVM",
    "ate": "OVV",
    "estado": "Distrito Federal",
    "uf": "DF",
    "detran": "https://www.detran.df.gov.br/"
  },
  {
    "de": "OVW",
    "ate": "OVY",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "OVZ",
    "ate": "OWG",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "OWH",
    "ate": "OXK",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "OXL",
    "ate": "OXL",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "OXM",
    "ate": "OXM",
    "estado": "Amazonas",
    "uf": "AM",
    "detran": "https://www.detran.am.gov.br/"
  },
  {
    "de": "OXN",
    "ate": "OXN",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "OXO",
    "ate": "OXO",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "OXP",
    "ate": "OXP",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "OXQ",
    "ate": "OXZ",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "OYA",
    "ate": "OYC",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "OYD",
    "ate": "OYK",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "OYL",
    "ate": "OYZ",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "OZA",
    "ate": "OZA",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "OZB",
    "ate": "OZB",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "OZC",
    "ate": "OZV",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "OZW",
    "ate": "PBZ",
    "estado": "Distrito Federal",
    "uf": "DF",
    "detran": "https://www.detran.df.gov.br/"
  },
  {
    "de": "PCA",
    "ate": "PED",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "PEE",
    "ate": "PFQ",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "PFR",
    "ate": "PGK",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "PGL",
    "ate": "PGU",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "PGV",
    "ate": "PGZ",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "PHA",
    "ate": "PHZ",
    "estado": "Amazonas",
    "uf": "AM",
    "detran": "https://www.detran.am.gov.br/"
  },
  {
    "de": "PIA",
    "ate": "PIZ",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "PJA",
    "ate": "PLZ",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "PMA",
    "ate": "POZ",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "PPA",
    "ate": "PPZ",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "PQA",
    "ate": "PRZ",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "PSA",
    "ate": "PTZ",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "PUA",
    "ate": "PZZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "QAA",
    "ate": "QAZ",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "QBA",
    "ate": "QCZ",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "QDA",
    "ate": "QEZ",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "QFA",
    "ate": "QFZ",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "QGA",
    "ate": "QGZ",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "QHA",
    "ate": "QJZ",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "QKA",
    "ate": "QKM",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "QKN",
    "ate": "QKZ",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "QLA",
    "ate": "QLM",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "QLN",
    "ate": "QLT",
    "estado": "Amapá",
    "uf": "AP",
    "detran": "https://www.detran.ap.gov.br/"
  },
  {
    "de": "QLU",
    "ate": "QLZ",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "QMA",
    "ate": "QMP",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "QMQ",
    "ate": "QQZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "QRA",
    "ate": "QRA",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "QRB",
    "ate": "QRM",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "QRN",
    "ate": "QRZ",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "QSA",
    "ate": "QSM",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "QSN",
    "ate": "QSZ",
    "estado": "São Paulo",
    "uf": "SP",
    "detran": "https://www.detran.sp.gov.br/"
  },
  {
    "de": "QTA",
    "ate": "QTJ",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "QTK",
    "ate": "QTM",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "QTN",
    "ate": "QTS",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "QTT",
    "ate": "QTT",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "QTU",
    "ate": "QTZ",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "QUA",
    "ate": "QUZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "QVA",
    "ate": "QVZ",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "QWA",
    "ate": "QWF",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "QWG",
    "ate": "QWL",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "QWM",
    "ate": "QWQ",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "QWR",
    "ate": "QXZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "QYA",
    "ate": "QYZ",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "QZA",
    "ate": "QZZ",
    "estado": "Amazonas",
    "uf": "AM",
    "detran": "https://www.detran.am.gov.br/"
  },
  {
    "de": "RAA",
    "ate": "RAJ",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "RAK",
    "ate": "RAZ",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "RBA",
    "ate": "RBJ",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "RBK",
    "ate": "RCN",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "RCO",
    "ate": "RDR",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "RDS",
    "ate": "REB",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "REC",
    "ate": "REV",
    "estado": "Distrito Federal",
    "uf": "DF",
    "detran": "https://www.detran.df.gov.br/"
  },
  {
    "de": "REW",
    "ate": "REZ",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "RFA",
    "ate": "RGD",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "RGE",
    "ate": "RGM",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "RGN",
    "ate": "RGN",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "RGO",
    "ate": "RGU",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "RGV",
    "ate": "RGZ",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "RHA",
    "ate": "RHZ",
    "estado": "Paraná",
    "uf": "PR",
    "detran": "https://www.detran.pr.gov.br/"
  },
  {
    "de": "RIA",
    "ate": "RIN",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "RIO",
    "ate": "RIO",
    "estado": "Rio de Janeiro",
    "uf": "RJ",
    "detran": "https://www.detran.rj.gov.br/"
  },
  {
    "de": "RIP",
    "ate": "RKV",
    "estado": "Rio de Janeiro",
    "uf": "RJ",
    "detran": "https://www.detran.rj.gov.br/"
  },
  {
    "de": "RKW",
    "ate": "RLP",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "RLQ",
    "ate": "RLZ",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "RMA",
    "ate": "RMC",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "RMD",
    "ate": "RNZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "ROA",
    "ate": "ROZ",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "RPA",
    "ate": "RPZ",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "RQA",
    "ate": "RQL",
    "estado": "Rio Grande do Norte",
    "uf": "RN",
    "detran": "https://www.detran.rn.gov.br/"
  },
  {
    "de": "RQM",
    "ate": "RQV",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "RQW",
    "ate": "RRH",
    "estado": "Sergipe",
    "uf": "SE",
    "detran": "https://www.detran.se.gov.br/"
  },
  {
    "de": "RRI",
    "ate": "RRZ",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "RSA",
    "ate": "RSF",
    "estado": "Tocantins",
    "uf": "TO",
    "detran": "https://www.detran.to.gov.br/"
  },
  {
    "de": "RSG",
    "ate": "RST",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "RSU",
    "ate": "RSZ",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "RTA",
    "ate": "RVZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "RWA",
    "ate": "RWJ",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "RWK",
    "ate": "RXJ",
    "estado": "Pará",
    "uf": "PA",
    "detran": "https://www.detran.pa.gov.br/"
  },
  {
    "de": "RXK",
    "ate": "RYZ",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "RZA",
    "ate": "RZD",
    "estado": "Roraima",
    "uf": "RR",
    "detran": "https://www.detran.rr.gov.br/"
  },
  {
    "de": "RZE",
    "ate": "RZZ",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "SAA",
    "ate": "SAJ",
    "estado": "Alagoas",
    "uf": "AL",
    "detran": "https://www.detran.al.gov.br/"
  },
  {
    "de": "SAK",
    "ate": "SAM",
    "estado": "Amapá",
    "uf": "AP",
    "detran": "https://www.detran.ap.gov.br/"
  },
  {
    "de": "SAN",
    "ate": "SBV",
    "estado": "Ceará",
    "uf": "CE",
    "detran": "https://www.detran.ce.gov.br/"
  },
  {
    "de": "SBW",
    "ate": "SDO",
    "estado": "Goiás",
    "uf": "GO",
    "detran": "https://www.detran.go.gov.br/"
  },
  {
    "de": "SDP",
    "ate": "SFO",
    "estado": "Paraná",
    "uf": "PR",
    "detran": "https://www.detran.pr.gov.br/"
  },
  {
    "de": "SFP",
    "ate": "SGM",
    "estado": "Espírito Santo",
    "uf": "ES",
    "detran": "https://www.detran.es.gov.br/"
  },
  {
    "de": "SGN",
    "ate": "SGZ",
    "estado": "Distrito Federal",
    "uf": "DF",
    "detran": "https://www.detran.df.gov.br/"
  },
  {
    "de": "SHA",
    "ate": "SHA",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "SHB",
    "ate": "SJI",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  },
  {
    "de": "SJJ",
    "ate": "SKT",
    "estado": "Bahia",
    "uf": "BA",
    "detran": "https://www.detran.ba.gov.br/"
  },
  {
    "de": "SKU",
    "ate": "SLF",
    "estado": "Paraíba",
    "uf": "PB",
    "detran": "https://www.detran.pb.gov.br/"
  },
  {
    "de": "SLG",
    "ate": "SLL",
    "estado": "Rondônia",
    "uf": "RO",
    "detran": "https://www.detran.ro.gov.br/"
  },
  {
    "de": "SLM",
    "ate": "SLV",
    "estado": "Piauí",
    "uf": "PI",
    "detran": "https://www.detran.pi.gov.br/"
  },
  {
    "de": "SLW",
    "ate": "SML",
    "estado": "Mato Grosso do Sul",
    "uf": "MS",
    "detran": "https://www.detran.ms.gov.br/"
  },
  {
    "de": "SMM",
    "ate": "SNJ",
    "estado": "Maranhão",
    "uf": "MA",
    "detran": "https://www.detran.ma.gov.br/"
  },
  {
    "de": "SNK",
    "ate": "SPB",
    "estado": "Pernambuco",
    "uf": "PE",
    "detran": "https://www.detran.pe.gov.br/"
  },
  {
    "de": "SPC",
    "ate": "SPV",
    "estado": "Mato Grosso",
    "uf": "MT",
    "detran": "https://www.detran.mt.gov.br/"
  },
  {
    "de": "SQQ",
    "ate": "SQU",
    "estado": "Acre",
    "uf": "AC",
    "detran": "https://www.detran.ac.gov.br/"
  },
  {
    "de": "SQV",
    "ate": "SRV",
    "estado": "Rio de Janeiro",
    "uf": "RJ",
    "detran": "https://www.detran.rj.gov.br/"
  },
  {
    "de": "SSF",
    "ate": "SSQ",
    "estado": "Distrito Federal",
    "uf": "DF",
    "detran": "https://www.detran.df.gov.br/"
  },
  {
    "de": "SSR",
    "ate": "SWZ",
    "estado": "São Paulo",
    "uf": "SP",
    "detran": "https://www.detran.sp.gov.br/"
  },
  {
    "de": "SXA",
    "ate": "SXZ",
    "estado": "Santa Catarina",
    "uf": "SC",
    "detran": "https://www.detran.sc.gov.br/"
  },
  {
    "de": "SYA",
    "ate": "SZZ",
    "estado": "Minas Gerais",
    "uf": "MG",
    "detran": "https://www.detran.mg.gov.br/"
  }
];
  if (typeof window !== 'undefined') window.FAIXAS_ESTADOS_BRASIL = faixas;
  if (typeof global !== 'undefined') global.FAIXAS_ESTADOS_BRASIL = faixas;
})();
