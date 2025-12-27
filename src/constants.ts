import { Part, Project } from "./types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    composer: "Queen",
    membersCount: 4,
    duration: "5:55",
    updatedAt: "Updated 1d ago",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtpmFtacB29ckRV3xI-xm3ZNd-Us7vbatMkwpcN2nYUwoldYm3DdhxhjO-_27oupQllj2h8fFNjvN8Xg5ExHR6PNvnzeeyhg9UM4RWUtFRuUK_LzVkZLWLBj9-LDo9aVfKds_-MCfsasAVjvqwIIraWQJ1e5VHOeP_FSVyie2VFlNVnsbxlleHTHggvDhjKLwLsNQ0DI_Ovx_ggOBu5_z632u2XSRgpNwoGrZtcvpTehznF1Z5wkAzMvkoh2SOQ9ZoFfEO3ZzGFcvw",
    lyrics: [
      { id: "l1", content: "Is this the real life?", parts: [Part.Soprano1, Part.Alto], timestamp: "00:00", seconds: 0 },
      { id: "l2", content: "Is this just fantasy?", parts: [Part.Tutti], timestamp: "00:05", seconds: 5 },
      { id: "l3", content: "Caught in a landslide", parts: [Part.Tutti], timestamp: "00:10", seconds: 10 },
      { id: "l4", content: "No escape from reality", parts: [Part.Tenor, Part.Bass], timestamp: "00:15", seconds: 15 },
      { id: "l5", content: "Open your eyes", parts: [Part.Tutti], timestamp: "00:20", seconds: 20 },
      { id: "l6", content: "Look up to the skies and see", parts: [Part.Soprano1, Part.Soprano2], timestamp: "00:25", seconds: 25 },
    ],
  },
  {
    id: "2",
    title: "Bridge Over Troubled Water",
    composer: "Arr. Paul Simon",
    membersCount: 45,
    duration: "4:12",
    updatedAt: "Updated 2h ago",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_1KgMkpi4ZkUkQEeiVRzeiJYKqKh3eGkS7BIJyVGhcK2tmmkDi_eLVGd-7FClj4rirBvVnyT1Tdpv00M-p-fierO3dpzuPJLko34Le8rT9AmWadYoPQpX68NDeAfL_Ch-GtMDPLdMznmlCBnttyZ2SzKAYVCo2CcI2KFZOp3Wad5rfr0aJmuFPPm51a3wnsWlqqhMVC314sqpUEzcYVf2t70GQo2vy_8aqeLKxzw4skLGM1XDl4GK1BkXm4Fe-7boGm9vbln-pmWi",
    lyrics: [
      { id: "l1", content: "When you're weary, feeling small", parts: [Part.Tenor], timestamp: "00:38", seconds: 38 },
      { id: "l2", content: "When tears are in your eyes", parts: [Part.Soprano1], timestamp: "00:41", seconds: 41 },
      { id: "l3", content: "I will dry them all", parts: [Part.Alto], timestamp: "00:45", seconds: 45 },
      { id: "l4", content: "I'm on your side", parts: [Part.Bass], timestamp: "00:50", seconds: 50 },
      { id: "l5", content: "When times get rough", parts: [Part.Tutti], timestamp: "00:55", seconds: 55 },
      { id: "l6", content: "And friends just can't be found", parts: [Part.Tutti], timestamp: "00:59", seconds: 59 },
    ],
  },
  {
    id: "3",
    title: "Ave Maria",
    composer: "Franz Schubert",
    membersCount: 2,
    duration: "6:20",
    updatedAt: "Updated 3d ago",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCOVmhl7diNNphXUz2prIsou6L7dGVYYQ1jCZUbMFqzJC-ne2M1sFNWg3ASrxv36xZKJyX1JWz-5BjZk6C_yz1jiILX_yhoiLVlWyliw5DaZJKW1_1hKT5qpv5t04pGQjQdoieN8jzZ0JZieXHRHZd0tBcMpAdQG1UhfudsgAMC3nmR9wgjzB-_DxQnrR7vhV25aDZQoHQSFxQ0mSU-g3rb88zVvwUWczQTGFvSOJmCc62AGFpFMXiFoIOTNzPdKyvpvU84NkbldoUm",
    lyrics: [],
  },
  {
    id: "4",
    title: "Carmina Burana",
    composer: "Carl Orff",
    membersCount: 120,
    duration: "1:05:00",
    updatedAt: "Updated 1w ago",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCIO65lWKQuAFMVeL_Daq6MpjFeXMLMxsxgj6N1FaXkTdqb-8Sezj1ksjZAXPFW9mZaYnH2O1ip-FSJerM46DbDvXdpS649YqN2I84gObercwlJMeEoe2TIpfl2KFzkMgrOLeuAhV2zLZbpkak22RXwtrxeALGlMpVQyBW-m10om27RtfOlb_vMJTMo1GrgPZJWJd04AcuI3BAcuYUPH0HRIV6J2otSd4JVTMXlXHISOFj1ulbAd8bJDkeT7HLbPHL0cQ3E1R-qIXJo",
    lyrics: [],
  },
  {
    id: "5",
    title: "Spring Concert",
    composer: "Various Artists",
    membersCount: 32,
    duration: "45:30",
    updatedAt: "Updated 2w ago",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj-v0Bem8Jt8e9X5yHXTD-RG8AVNcnLr0Ls8xnj_lfHjOms9Id37iSK4EuKtajMcI0rPCb-tmhodyyIDpXPsCi87woPpdN-PjeAbH-M6LHHStfpbzx99BsaND-zPvHcuYsuRpkAb-fInYceeOlO17eJqLwZfr-Cuj-N_YtXBDxr1JD61OA2Jysvqg0L48gmGBfoOmwivJ0HQbmg36czz0EwPLoiLuZi6wQxhVB4ZIl0tmUltXCPxDq9KTqjLZOH_aGOI7MVIdxcC5B",
    lyrics: [],
  },
  {
    id: "6",
    title: "Winter Gala",
    composer: "Setlist",
    membersCount: 60,
    duration: "1:30:00",
    updatedAt: "Updated 1mo ago",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5eSAi2Jj4pdisge0Tnb8vFZZ7osizK_VTZ7fHXLymouqYOwPEtUID4esksPFBxj1aFaZHZ4ymsNBqhWMEsQlrTB9yTImdIPpi_szEff8p1pfqvnstHzuBXAN5-uGg3NHE9gpbUOk_dq1UO5nmJkvBBD_ABye-hzVqLN5O99K28GlaA1pXMlx95xUlRxzYdVnnTai2MFhLgiE3Imr3QrpXRCN6PiVjSZQdXJ0tMHvkt9DX-4kkIlRYnKVbiGz9gN5vKh7gLo4YZOvb",
    lyrics: [],
  },
];
