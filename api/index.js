// server.ts
import express from "express";
import path from "path";
import dotenv from "dotenv";

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0156039264",
  appId: "1:437425352966:web:52db4acc3fedc31e026e87",
  apiKey: "AIzaSyDpYfe7_BEmujIOGP7jwJf-bjYiJKI1O9k",
  authDomain: "gen-lang-client-0156039264.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-scholarlensresea-2d0aba2f-84b3-461b-8060-ccd0379164da",
  storageBucket: "gen-lang-client-0156039264.firebasestorage.app",
  messagingSenderId: "437425352966",
  measurementId: "",
  oAuthClientId: "437425352966-rb3cp75vvj7tu5eb8knafjvbg2003kf9.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/data/verifiedScholarCache.json
var verifiedScholarCache_default = {
  be8uiCkAAAAJ: {
    profile: {
      id: "scholar-be8uiCkAAAAJ",
      scholarUserId: "be8uiCkAAAAJ",
      scholarUrl: "https://scholar.google.com/citations?user=be8uiCkAAAAJ&hl=en",
      name: "ASM Shihavuddin",
      affiliation: "Professor and Head, Department of EEE, University of Liberal Arts Bangladesh (ULAB)",
      homeUniversityId: "university-of-liberal-arts-bangladesh",
      homeUniversity: "University of Liberal Arts Bangladesh",
      homeCity: "Dhaka",
      homeCountry: "Bangladesh",
      homeLat: 23.7548,
      homeLng: 90.3585,
      verifiedDomain: "eee.green.edu.bd",
      fields: [
        "Computer vision",
        "Image processing",
        "Bioinformatics",
        "Data mining",
        "Machine learning"
      ],
      officialMetrics: {
        totalCitations: 3978,
        hIndex: 30,
        i10Index: 61
      },
      publications: [
        {
          id: "gs-0",
          title: "Wind turbine surface damage detection by deep learning aided drone inspection analysis",
          year: 2019,
          citations: 352,
          venue: "Energies",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/en12040676",
          coAuthors: [
            {
              name: "Xiao Dong Chen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Vladimir Fedorov",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Nicolai A. B. Riis",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Anders Nymark Christensen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Kim Branner",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Anders Bjorholm Dahl",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Rasmus R. Paulsen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/en12040676"
        },
        {
          id: "gs-1",
          title: "Deep learning enabled state of charge, state of health and remaining useful life estimation for smart battery management system: Methods, implementations, issues and prospects",
          year: 2022,
          citations: 216,
          venue: "Journal of Energy Storage",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.est.2022.105752",
          coAuthors: [
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shaheer Ansari",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            },
            {
              name: "Md. Sazal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sazal Miah",
              universityId: "asian-institute-of-technology",
              universityName: "Asian Institute of Technology",
              city: "Pathum Thani",
              country: "Thailand",
              countryCode: "TH",
              continent: "Asia",
              lat: 14.01346,
              lng: 100.53049,
              isHomeInstitution: false
            },
            {
              name: "Sheikh Tanzim Meraj",
              universityId: "deakin-university",
              universityName: "Deakin University",
              city: "Burwood",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -37.84978,
              lng: 145.11901,
              isHomeInstitution: false
            },
            {
              name: "Kamrul Hasan",
              universityId: "universiti-teknologi-mara",
              universityName: "Universiti Teknologi MARA",
              city: "Shah Alam",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.08507,
              lng: 101.53281,
              isHomeInstitution: false
            },
            {
              name: "M. A. Hannan",
              universityId: "universiti-tenaga-nasional",
              universityName: "Universiti Tenaga Nasional",
              city: "Kuala Selangor",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.35,
              lng: 101.25,
              isHomeInstitution: false
            },
            {
              name: "Kashem Mohammad Muttaqi",
              universityId: "university-of-wollongong",
              universityName: "University of Wollongong",
              city: "Wollongong",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -34.42399978637695,
              lng: 150.89344787597656,
              isHomeInstitution: false
            },
            {
              name: "Aini Hussain",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.est.2022.105752"
        },
        {
          id: "gs-2",
          title: "Towards highly accurate coral texture images classification using deep convolutional neural networks and data augmentation",
          year: 2019,
          citations: 193,
          venue: "Expert Systems with Applications",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.eswa.2018.10.010",
          coAuthors: [
            {
              name: "Anabel G\xF3mez-R\xEDos",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Siham Tabik",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Juli\xE1n Luengo",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Bartosz Krawczyk",
              universityId: "virginia-commonwealth-university",
              universityName: "Virginia Commonwealth University",
              city: "Richmond",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 37.55376,
              lng: -77.46026,
              isHomeInstitution: false
            },
            {
              name: "Francisco Herrera",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.eswa.2018.10.010"
        },
        {
          id: "gs-3",
          title: "Outcome based education (OBE): Defining the process and practice for engineering education",
          year: 2022,
          citations: 182,
          venue: "IEEE Access",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/access.2022.3219477",
          coAuthors: [
            {
              name: "M. M. Mahbubul Syeed",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Faisal Uddin",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Mahady Hasan",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Razib Hayat Khan",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/access.2022.3219477"
        },
        {
          id: "gs-4",
          title: "Image-based coral reef classification and thematic mapping",
          year: 2013,
          citations: 171,
          venue: "Remote Sensing",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/rs5041809",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Arthur C. R. Gleason",
              universityId: "university-of-miami",
              universityName: "University of Miami",
              city: "Coral Gables",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 25.72149,
              lng: -80.26838,
              isHomeInstitution: false
            },
            {
              name: "Brooke Gintert",
              universityId: "university-of-miami",
              universityName: "University of Miami",
              city: "Coral Gables",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 25.72149,
              lng: -80.26838,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/rs5041809"
        },
        {
          id: "gs-5",
          title: "DeepThin: A novel lightweight CNN architecture for traffic sign recognition without GPU requirements",
          year: 2021,
          citations: 163,
          venue: "Expert Systems with Applications",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.eswa.2020.114481",
          coAuthors: [
            {
              name: "Wasif Arman Haque",
              universityId: "the-university-of-texas-at-dallas",
              universityName: "The University of Texas at Dallas",
              city: "Richardson",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 32.94818,
              lng: -96.72972,
              isHomeInstitution: false
            },
            {
              name: "Samin Arefin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "university-of-liberal-arts-bangladesh",
              universityName: "University of Liberal Arts Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.741004943847656,
              lng: 90.37438201904297,
              isHomeInstitution: true
            }
          ],
          doi: "10.1016/j.eswa.2020.114481"
        },
        {
          id: "gs-6",
          title: "Adult neural stem cells and multiciliated ependymal cells share a common lineage regulated by the geminin family members",
          year: 2019,
          citations: 161,
          venue: "Neuron",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.neuron.2019.01.051",
          coAuthors: [
            {
              name: "Gonzalo Ortiz-\xC1lvarez",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Gonzalo Ortiz-\xC1lvarez",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Gonzalo Ortiz-\xC1lvarez",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Gonzalo Ortiz-\xC1lvarez",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Gonzalo Ortiz-\xC1lvarez",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Aur\xE9lien Fortoul",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Aur\xE9lien Fortoul",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Aur\xE9lien Fortoul",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Aur\xE9lien Fortoul",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Aur\xE9lien Fortoul",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sol\xE8ne Clavreul",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sol\xE8ne Clavreul",
              universityId: "institut-de-la-vision",
              universityName: "Institut de la Vision",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sol\xE8ne Clavreul",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sol\xE8ne Clavreul",
              universityId: "sorbonne-universit",
              universityName: "Sorbonne Universit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Maria\u2010Eleni Lalioti",
              universityId: "university-of-patras",
              universityName: "University of Patras",
              city: "P\xE1trai",
              country: "Greece",
              countryCode: "GR",
              continent: "Europe",
              lat: 38.24443817138672,
              lng: 21.734439849853516,
              isHomeInstitution: false
            },
            {
              name: "Stavros L. Taraviras",
              universityId: "university-of-patras",
              universityName: "University of Patras",
              city: "P\xE1trai",
              country: "Greece",
              countryCode: "GR",
              continent: "Europe",
              lat: 38.24443817138672,
              lng: 21.734439849853516,
              isHomeInstitution: false
            },
            {
              name: "Simon Hippenmeyer",
              universityId: "institute-of-science-and-technology-austria",
              universityName: "Institute of Science and Technology Austria",
              city: "Klosterneuburg",
              country: "Austria",
              countryCode: "AT",
              continent: "Europe",
              lat: 48.30521011352539,
              lng: 16.325220108032227,
              isHomeInstitution: false
            },
            {
              name: "Jean Livet",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Jean Livet",
              universityId: "institut-de-la-vision",
              universityName: "Institut de la Vision",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Jean Livet",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Jean Livet",
              universityId: "sorbonne-universit",
              universityName: "Sorbonne Universit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.neuron.2019.01.051"
        },
        {
          id: "gs-7",
          title: "A Human-Cyber-Physical System toward Intelligent Wind Turbine Operation and Maintenance",
          year: 2021,
          citations: 138,
          venue: "Sustainability",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/su13020561",
          coAuthors: [
            {
              name: "Xiao Dong Chen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "M. Eder",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Dan Zheng",
              universityId: "university-of-chinese-academy-of-sciences",
              universityName: "University of Chinese Academy of Sciences",
              city: "Beijing",
              country: "China",
              countryCode: "CN",
              continent: "Asia",
              lat: 39.9075,
              lng: 116.39723,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/su13020561"
        },
        {
          id: "gs-8",
          title: "Artificial intelligence approaches for advanced battery management system in electric vehicle applications: A statistical analysis towards future research opportunities",
          year: 2023,
          citations: 125,
          venue: "Vehicles",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/vehicles6010002",
          coAuthors: [
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sazal Miah",
              universityId: "federation-university",
              universityName: "Federation University",
              city: "Ballarat",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -37.566219329833984,
              lng: 143.8495635986328,
              isHomeInstitution: false
            },
            {
              name: "Taskin Jamal",
              universityId: "ahsanullah-university-of-science-and-technology",
              universityName: "Ahsanullah University of Science and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Tuhibur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shaheer Ansari",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            },
            {
              name: "Md. Siddikur Rahman",
              universityId: "universiti-teknologi-petronas",
              universityName: "Universiti Teknologi Petronas",
              city: "Ipoh",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 4.5841,
              lng: 101.0829,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammed Nazmus Shakib",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/vehicles6010002"
        },
        {
          id: "gs-9",
          title: "Ependymal cilia beating induces an actin network to protect centrioles against shear stress",
          year: 2018,
          citations: 106,
          venue: "Nature Communications",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1038/s41467-018-04676-w",
          coAuthors: [
            {
              name: "Alexia Mahuzier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Mahuzier",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Mahuzier",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Mahuzier",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Mahuzier",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "sorbonne-universit",
              universityName: "Sorbonne Universit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "institut-des-sciences-mol-culaires",
              universityName: "Institut des Sciences Mol\xE9culaires",
              city: "Talence",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 44.80849,
              lng: -0.58915,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "institut-de-biologie-int-grative-de-la-cellule",
              universityName: "Institut de Biologie Int\xE9grative de la Cellule",
              city: "Gif-sur-Yvette",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.68333,
              lng: 2.13333,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "institut-du-cerveau",
              universityName: "Institut du Cerveau",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Cl\xE9mence Fournier",
              universityId: "universit-pierre-et-marie-curie",
              universityName: "Universit\xE9 Pierre-et-Marie-Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Pauline Lansade",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Meriem Garfa\u2010Traor\xE9",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Meriem Garfa\u2010Traor\xE9",
              universityId: "sorbonne-paris-cit",
              universityName: "Sorbonne Paris Cit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Meriem Garfa\u2010Traor\xE9",
              universityId: "structure-f-d-rative-de-recherche-necker",
              universityName: "Structure f\xE9d\xE9rative de recherche Necker",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie\u2010France Carlier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie\u2010France Carlier",
              universityId: "institut-de-biologie-int-grative-de-la-cellule",
              universityName: "Institut de Biologie Int\xE9grative de la Cellule",
              city: "Gif-sur-Yvette",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.68333,
              lng: 2.13333,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Voituriez",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Voituriez",
              universityId: "laboratoire-jean-perrin",
              universityName: "Laboratoire Jean Perrin",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Voituriez",
              universityId: "laboratoire-de-physique-th-orique-de-la-mati-re-condens-e",
              universityName: "Laboratoire de Physique Th\xE9orique de la Mati\xE8re Condens\xE9e",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Voituriez",
              universityId: "universit-pierre-et-marie-curie",
              universityName: "Universit\xE9 Pierre-et-Marie-Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1038/s41467-018-04676-w"
        },
        {
          id: "gs-10",
          title: "Image based surface damage detection of renewable energy installations using a unified deep learning approach",
          year: 2021,
          citations: 105,
          venue: "Energy Reports",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.egyr.2021.07.045",
          coAuthors: [
            {
              name: "Mohammad Rifat Ahmmad Rashid",
              universityId: "university-of-liberal-arts-bangladesh",
              universityName: "University of Liberal Arts Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.741004943847656,
              lng: 90.37438201904297,
              isHomeInstitution: true
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "university-of-liberal-arts-bangladesh",
              universityName: "University of Liberal Arts Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.741004943847656,
              lng: 90.37438201904297,
              isHomeInstitution: true
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.egyr.2021.07.045"
        },
        {
          id: "gs-11",
          title: "mTORC1 signaling and primary cilia are required for brain ventricle morphogenesis",
          year: 2017,
          citations: 104,
          venue: "Development",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1242/dev.138271",
          coAuthors: [
            {
              name: "Philippe Foerster",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Philippe Foerster",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Philippe Foerster",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Philippe Foerster",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Philippe Foerster",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alessandra Boletta",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alessandra Boletta",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alessandra Boletta",
              universityId: "irccs-ospedale-san-raffaele",
              universityName: "IRCCS Ospedale San Raffaele",
              city: "Milan",
              country: "Italy",
              countryCode: "IT",
              continent: "Europe",
              lat: 45.46427,
              lng: 9.18951,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1242/dev.138271"
        },
        {
          id: "gs-12",
          title: "Calibrated mitotic oscillator drives motile ciliogenesis",
          year: 2017,
          citations: 103,
          venue: "ScienceAsia",
          quartile: "Q3",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1126/science.aan8311",
          coAuthors: [
            {
              name: "Adel Al Jord",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Adel Al Jord",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Adel Al Jord",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Adel Al Jord",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Adel Al Jord",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Servignat d\u2019Aout",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Servignat d\u2019Aout",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Servignat d\u2019Aout",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Servignat d\u2019Aout",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rapha\xEBl Servignat d\u2019Aout",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Anthi Kara\u0131\u0308skou",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Anthi Kara\u0131\u0308skou",
              universityId: "centre-de-recherche-saint-antoine",
              universityName: "Centre de Recherche Saint-Antoine",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85340881347656,
              lng: 2.34879994392395,
              isHomeInstitution: false
            },
            {
              name: "Anthi Kara\u0131\u0308skou",
              universityId: "universit-pierre-et-marie-curie",
              universityName: "Universit\xE9 Pierre-et-Marie-Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Jo\xEBlle Sobczak\u2010Th\xE9pot",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Jo\xEBlle Sobczak\u2010Th\xE9pot",
              universityId: "centre-de-recherche-saint-antoine",
              universityName: "Centre de Recherche Saint-Antoine",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85340881347656,
              lng: 2.34879994392395,
              isHomeInstitution: false
            },
            {
              name: "Jo\xEBlle Sobczak\u2010Th\xE9pot",
              universityId: "universit-pierre-et-marie-curie",
              universityName: "Universit\xE9 Pierre-et-Marie-Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1126/science.aan8311"
        },
        {
          id: "gs-13",
          title: "Optimizing energy solutions: A techno-economic analysis of solar-wind hybrid power generation in the coastal regions of Bangladesh",
          year: 2024,
          citations: 81,
          venue: "Energy Conversion and Management: X",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.ecmx.2024.100605",
          coAuthors: [
            {
              name: "Md. Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.ecmx.2024.100605"
        },
        {
          id: "gs-14",
          title: "Techno-economic and carbon emission assessment of a large-scale floating solar PV system for sustainable energy generation in support of Malaysia\u2019s renewable energy roadmap",
          year: 2023,
          citations: 80,
          venue: "Energies",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/en16104034",
          coAuthors: [
            {
              name: "Md. Imamul Islam",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Mohd Shawal Jadin",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Nor Azwan Mohamed Kamari",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            },
            {
              name: "Taskin Jamal",
              universityId: "ahsanullah-university-of-science-and-technology",
              universityName: "Ahsanullah University of Science and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohd Nurulakla Mohd Azlan",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Mahidur R. Sarker",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/en16104034"
        },
        {
          id: "gs-15",
          title: "Compound local binary pattern (CLBP) for robust facial expression recognition",
          year: 2011,
          citations: 78,
          venue: "Computational Intelligence and Informatics (CINTI), 2011 IEEE 12th \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/cinti.2011.6108536",
          coAuthors: [
            {
              name: "Faisal Ahmed",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Emam Hossain",
              universityId: "prime-university",
              universityName: "Prime University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "A.S.M. Hossain Bari",
              universityId: "samsung-south-korea",
              universityName: "Samsung (South Korea)",
              city: "Seoul",
              country: "South Korea",
              countryCode: "KR",
              continent: "Asia",
              lat: 37.566,
              lng: 126.9784,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/cinti.2011.6108536"
        },
        {
          id: "gs-16",
          title: "Smooth 2D manifold extraction from 3D image stack",
          year: 2017,
          citations: 76,
          venue: "Nature Communications",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1038/ncomms15554",
          coAuthors: [
            {
              name: "Sreetama Basu",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "coll-ge-de-france",
              universityName: "Coll\xE8ge de France",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "centre-interdisciplinaire-de-recherche-en-biologie",
              universityName: "Centre Interdisciplinaire de Recherche en Biologie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "institut-curie",
              universityName: "Institut Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Felipe Delestro",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Felipe Delestro",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Felipe Delestro",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Felipe Delestro",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Felipe Delestro",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nikita Menezes",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "S\xE9verine M. Sigoillot",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "S\xE9verine M. Sigoillot",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "S\xE9verine M. Sigoillot",
              universityId: "coll-ge-de-france",
              universityName: "Coll\xE8ge de France",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "S\xE9verine M. Sigoillot",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "S\xE9verine M. Sigoillot",
              universityId: "centre-interdisciplinaire-de-recherche-en-biologie",
              universityName: "Centre Interdisciplinaire de Recherche en Biologie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elaine Del Nery",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elaine Del Nery",
              universityId: "institut-curie",
              universityName: "Institut Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Fekrije Selimi",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Fekrije Selimi",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Fekrije Selimi",
              universityId: "coll-ge-de-france",
              universityName: "Coll\xE8ge de France",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Fekrije Selimi",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Fekrije Selimi",
              universityId: "centre-interdisciplinaire-de-recherche-en-biologie",
              universityName: "Centre Interdisciplinaire de Recherche en Biologie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1038/ncomms15554"
        },
        {
          id: "gs-17",
          title: "Adaptation for sustainable implementation of Smart Grid in developing countries like Bangladesh",
          year: 2020,
          citations: 71,
          venue: "Energy Reports",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.egyr.2020.09.010",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Suman Kumar Dey",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.egyr.2020.09.010"
        },
        {
          id: "gs-18",
          title: "Feasibility analysis of floating photovoltaic power plant in Bangladesh: A case study in Hatirjheel Lake, Dhaka",
          year: 2023,
          citations: 64,
          venue: "Sustainable Energy Technologies and Assessments",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.seta.2022.102994",
          coAuthors: [
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohd Shawal Jadin",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.seta.2022.102994"
        },
        {
          id: "gs-19",
          title: "Coral species identification with texture or structure images using a two-level classifier based on Convolutional Neural Networks",
          year: 2019,
          citations: 63,
          venue: "Knowledge-Based Systems",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.knosys.2019.104891",
          coAuthors: [
            {
              name: "Anabel G\xF3mez-R\xEDos",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Siham Tabik",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Juli\xE1n Luengo",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Francisco Herrera",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.knosys.2019.104891"
        },
        {
          id: "gs-20",
          title: "Greenotyper: Image-based plant phenotyping using distributed computing and deep learning",
          year: 2020,
          citations: 59,
          venue: "Frontiers in Plant Science",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3389/fpls.2020.01181",
          coAuthors: [
            {
              name: "Marni Tausen",
              universityId: "aarhus-university",
              universityName: "Aarhus University",
              city: "Aarhus",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 56.15674,
              lng: 10.21076,
              isHomeInstitution: false
            },
            {
              name: "Marc Clausen",
              universityId: "aarhus-university",
              universityName: "Aarhus University",
              city: "Aarhus",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 56.15674,
              lng: 10.21076,
              isHomeInstitution: false
            },
            {
              name: "Sara Moeskj\xE6r",
              universityId: "aarhus-university",
              universityName: "Aarhus University",
              city: "Aarhus",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 56.15674,
              lng: 10.21076,
              isHomeInstitution: false
            },
            {
              name: "Anders Bjorholm Dahl",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Luc Janss",
              universityId: "aarhus-university",
              universityName: "Aarhus University",
              city: "Aarhus",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 56.15674,
              lng: 10.21076,
              isHomeInstitution: false
            },
            {
              name: "Stig Uggerh\xF8j Andersen",
              universityId: "aarhus-university",
              universityName: "Aarhus University",
              city: "Aarhus",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 56.15674,
              lng: 10.21076,
              isHomeInstitution: false
            }
          ],
          doi: "10.3389/fpls.2020.01181"
        },
        {
          id: "gs-22",
          title: "Integrating PV-based energy production utilizing the existing infrastructure of MRT-6 at Dhaka, Bangladesh",
          year: 2024,
          citations: 50,
          venue: "Heliyon",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.heliyon.2024.e24078",
          coAuthors: [
            {
              name: "Md Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Majedul Hoque",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.heliyon.2024.e24078"
        },
        {
          id: "gs-23",
          title: "Lightweight and Parameter-Optimized Real-Time food calorie estimation from images using CNN-Based approach",
          year: 2022,
          citations: 46,
          venue: "Applied Sciences",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/app12199733",
          coAuthors: [
            {
              name: "Rakib Ul Haque",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Razib Hayat Khan",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "M. M. Mahbubul Syeed",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Faisal Uddin",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/app12199733"
        },
        {
          id: "gs-24",
          title: "AQUADA: Automated quantification of damages in composite wind turbine blades for LCOE reduction",
          year: 2021,
          citations: 45,
          venue: "Wind Energy",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1002/we.2587",
          coAuthors: [
            {
              name: "Xiao Dong Chen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Steen Hjelm Madsen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Kenneth Thomsen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Steffen Rasmussen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Kim Branner",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.1002/we.2587"
        },
        {
          id: "gs-25",
          title: "A study on local binary pattern for automated weed classification using template matching and support vector machine",
          year: 2011,
          citations: 38,
          venue: "Computational Intelligence and Informatics (CINTI), 2011 IEEE 12th \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/cinti.2011.6108524",
          coAuthors: [
            {
              name: "Faisal Ahmed",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "A.S.M. Hossain Bari",
              universityId: "samsung-south-korea",
              universityName: "Samsung (South Korea)",
              city: "Seoul",
              country: "South Korea",
              countryCode: "KR",
              continent: "Asia",
              lat: 37.566,
              lng: 126.9784,
              isHomeInstitution: false
            },
            {
              name: "Hawlader Abdullah Al-Mamun",
              universityId: "university-of-new-england",
              universityName: "University of New England",
              city: "Armidale",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -30.50123,
              lng: 151.66553,
              isHomeInstitution: false
            },
            {
              name: "Paul Kwan",
              universityId: "university-of-new-england",
              universityName: "University of New England",
              city: "Armidale",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -30.50123,
              lng: 151.66553,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/cinti.2011.6108524"
        },
        {
          id: "gs-26",
          title: "Impact of strain on the electronic, phonon, and optical properties of monolayer transition metal dichalcogenides XTe 2 (X = Mo and W)",
          year: 2022,
          citations: 36,
          venue: "Physica Scripta",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1088/1402-4896/ac57e0",
          coAuthors: [
            {
              name: "Md. Rasidul Islam",
              universityId: "chinese-academy-of-sciences",
              universityName: "Chinese Academy of Sciences",
              city: "Beijing",
              country: "China",
              countryCode: "CN",
              continent: "Asia",
              lat: 39.9075,
              lng: 116.39723,
              isHomeInstitution: false
            },
            {
              name: "Md. Rasidul Islam",
              universityId: "institute-of-semiconductors",
              universityName: "Institute of Semiconductors",
              city: "Beijing",
              country: "China",
              countryCode: "CN",
              continent: "Asia",
              lat: 39.9075,
              lng: 116.39723,
              isHomeInstitution: false
            },
            {
              name: "Md. Rasidul Islam",
              universityId: "jamalpur-science-and-technology-university",
              universityName: "Jamalpur Science and Technology University",
              city: "Melandaha Upazila",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 24.96,
              lng: 89.83,
              isHomeInstitution: false
            },
            {
              name: "Md. Rayid Hasan Mojumder",
              universityId: "khulna-university-of-engineering-and-technology",
              universityName: "Khulna University of Engineering and Technology",
              city: "Khulna",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.809789657592773,
              lng: 89.56439208984375,
              isHomeInstitution: false
            },
            {
              name: "Md. Rayid Hasan Mojumder",
              universityId: "daffodil-international-university",
              universityName: "Daffodil International University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Biazid Kabir Moghal",
              universityId: "khulna-university-of-engineering-and-technology",
              universityName: "Khulna University of Engineering and Technology",
              city: "Khulna",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.809789657592773,
              lng: 89.56439208984375,
              isHomeInstitution: false
            },
            {
              name: "A. S. M. Jannatul Islam",
              universityId: "khulna-university-of-engineering-and-technology",
              universityName: "Khulna University of Engineering and Technology",
              city: "Khulna",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.809789657592773,
              lng: 89.56439208984375,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Raza Miah",
              universityId: "chinese-academy-of-sciences",
              universityName: "Chinese Academy of Sciences",
              city: "Beijing",
              country: "China",
              countryCode: "CN",
              continent: "Asia",
              lat: 39.9075,
              lng: 116.39723,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Raza Miah",
              universityId: "ningbo-institute-of-industrial-technology",
              universityName: "Ningbo Institute of Industrial Technology",
              city: "Ningbo",
              country: "China",
              countryCode: "CN",
              continent: "Asia",
              lat: 29.87819,
              lng: 121.54945,
              isHomeInstitution: false
            },
            {
              name: "Sourav Roy",
              universityId: "khulna-university-of-engineering-and-technology",
              universityName: "Khulna University of Engineering and Technology",
              city: "Khulna",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.809789657592773,
              lng: 89.56439208984375,
              isHomeInstitution: false
            },
            {
              name: "Anuj Kumar",
              universityId: "gla-university",
              universityName: "GLA University",
              city: "Mathura",
              country: "India",
              countryCode: "IN",
              continent: "Asia",
              lat: 27.5035,
              lng: 77.67215,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1088/1402-4896/ac57e0"
        },
        {
          id: "gs-27",
          title: "Sequential transfer learning based on hierarchical clustering for improved performance in deep learning based food segmentation",
          year: 2021,
          citations: 35,
          venue: "Scientific Reports",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1038/s41598-020-79677-1",
          coAuthors: [
            {
              name: "Mia Sandra Nicole Siemon",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Gitte Ravn\u2010Haren",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.1038/s41598-020-79677-1"
        },
        {
          id: "oa-153",
          title: "mTORC1 signaling and primary cilia are required for brain ventricle morphogenesis",
          year: 2017,
          citations: 35,
          venue: "Journal of Cell Science",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          doi: "10.1242/jcs.201640",
          url: "https://doi.org/10.1242/jcs.201640",
          coAuthors: [
            {
              name: "Philippe Foerster",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Marie Daclin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Alessandra Boletta",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-28",
          title: "Exergy based evaluation of power plants for sustainability and economic performance identification",
          year: 2021,
          citations: 33,
          venue: "Case Studies in Thermal Engineering",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.csite.2021.101393",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mamun Rabbani",
              universityId: "university-of-dhaka",
              universityName: "University of Dhaka",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Murad Kabir Nipun",
              universityId: "international-university-of-business-agriculture-and-technology",
              universityName: "International University of Business Agriculture and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.csite.2021.101393"
        },
        {
          id: "gs-29",
          title: "Online Sunflicker Removal using Dynamic Texture Prediction",
          year: 2012,
          citations: 30,
          venue: "International Conference on Computer Vision Theory and Applications (VISAPP \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.5220/0003811901610167",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            }
          ],
          doi: "10.5220/0003811901610167"
        },
        {
          id: "gs-30",
          title: "Investigation of PV modules electrical characteristics for laboratory experiments using halogen solar simulator",
          year: 2020,
          citations: 27,
          venue: "2020 2nd International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti50764.2020.9350496",
          coAuthors: [
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti50764.2020.9350496"
        },
        {
          id: "gs-31",
          title: "Automated classification and thematic mapping of bacterial mats in the north sea",
          year: 2013,
          citations: 27,
          venue: "2013 MTS/IEEE OCEANS-Bergen",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/oceans-bergen.2013.6608111",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Javier Escartin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rolf B. Pedersen",
              universityId: "university-of-bergen",
              universityName: "University of Bergen",
              city: "Bergen",
              country: "Norway",
              countryCode: "NO",
              continent: "Europe",
              lat: 60.39299,
              lng: 5.32415,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/oceans-bergen.2013.6608111"
        },
        {
          id: "gs-32",
          title: "AQUADA PLUS: Automated damage inspection of cyclic-loaded large-scale composite structures using thermal imagery and computer vision",
          year: 2023,
          citations: 26,
          venue: "Composite Structures",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.compstruct.2023.117085",
          coAuthors: [
            {
              name: "Xiao Dong Chen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Shohreh Sheiati",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.compstruct.2023.117085"
        },
        {
          id: "gs-33",
          title: "A comparative analysis of soft switching techniques in reducing the energy loss and improving the soft switching range in power converters",
          year: 2022,
          citations: 26,
          venue: "Electronics",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/electronics11071062",
          coAuthors: [
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Zainal Salam",
              universityId: "university-of-technology-malaysia",
              universityName: "University of Technology Malaysia",
              city: "Johor Bahru",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 1.4655,
              lng: 103.7578,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fayzur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Panos C. Kotsampopoulos",
              universityId: "national-technical-university-of-athens",
              universityName: "National Technical University of Athens",
              city: "Athens",
              country: "Greece",
              countryCode: "GR",
              continent: "Europe",
              lat: 37.98376,
              lng: 23.72784,
              isHomeInstitution: false
            },
            {
              name: "Hady Habib Fayek",
              universityId: "heliopolis-university",
              universityName: "Heliopolis University",
              city: "Cairo",
              country: "Egypt",
              countryCode: "EG",
              continent: "Africa",
              lat: 30.153921127319336,
              lng: 31.431650161743164,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/electronics11071062"
        },
        {
          id: "gs-34",
          title: "Optimizing hybrid renewable energy based automated railway level crossing in Bangladesh: Techno-economic, emission and sensitivity analysis",
          year: 2024,
          citations: 25,
          venue: "Energy Conversion and Management: X",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.ecmx.2024.100744",
          coAuthors: [
            {
              name: "Zia Ul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Tahia Fahrin Karim",
              universityId: "university-of-asia-pacific",
              universityName: "University of Asia Pacific",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abu M. Fuad",
              universityId: "university-of-scholars",
              universityName: "University of Scholars",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.ecmx.2024.100744"
        },
        {
          id: "gs-35",
          title: "Effects of aging factors on PV modules output power: An experimental investigation",
          year: 2022,
          citations: 24,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103307",
          coAuthors: [
            {
              name: "Tuhibur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shyful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sahin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Razibul Awal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103307"
        },
        {
          id: "gs-36",
          title: "Mitigation of mismatch power loss in aged photovoltaic arrays following a comparative investigation into module rearrangement techniques",
          year: 2022,
          citations: 23,
          venue: "Energy Reports",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.egyr.2022.01.013",
          coAuthors: [
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Mozaharul Mottalib",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.egyr.2022.01.013"
        },
        {
          id: "gs-38",
          title: "Computer vision in vehicle technology: Land, sea, and air",
          year: 2017,
          citations: 21,
          venue: "John Wiley & Sons",
          quartile: "Unranked",
          type: "Book Chapter",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://orbit.dtu.dk/en/publications/computer-vision-in-vehicle-technology-land-sea--air(d0c343d1-9d92-4578-b548-1d15218847dc).html",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Campos",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Nat\xE0lia Hurt\xF3s",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Prados",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Tudor Nicosevici",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Arma\u011Fan Elibol",
              universityId: "y-ld-z-technical-university",
              universityName: "Y\u0131ld\u0131z Technical University",
              city: "Istanbul",
              country: "T\xFCrkiye",
              countryCode: "TR",
              continent: "Europe",
              lat: 41.01383972167969,
              lng: 28.94965934753418,
              isHomeInstitution: false
            },
            {
              name: "L\xE1szl\xF3 Neumann",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Javier Escartin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-39",
          title: "Road boundary detection by a remote vehicle using radon transform for path map generation of an unknown area",
          year: 2008,
          citations: 21,
          venue: "International Journal of Computer Science and Network Security",
          quartile: "Q4",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&pagesize=100&citation_for_view=be8uiCkAAAAJ:0CzhzZyukY4C",
          coAuthors: [
            {
              name: "K Ahmed",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MS Munir",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "KR Ahmed",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-40",
          title: "Prospect of electric boat in Dhaka: an alternate way of transportation",
          year: 2022,
          citations: 20,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103245",
          coAuthors: [
            {
              name: "Md Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Jaudat Nahian",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103245"
        },
        {
          id: "gs-41",
          title: "Prediction of stock price analyzing the online financial news using Naive Bayes classifier and local economic trends",
          year: 2010,
          citations: 20,
          venue: "Advanced Computer Theory and Engineering (ICACTE), 2010 3rd International \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icacte.2010.5579624",
          coAuthors: [
            {
              name: "Mir Nahidul Ambia",
              universityId: "eastern-university",
              universityName: "Eastern University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.742799758911133,
              lng: 90.38059997558594,
              isHomeInstitution: false
            },
            {
              name: "Mir Mohammad Nazmul Arefin",
              universityId: "stamford-university-bangladesh",
              universityName: "Stamford University Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mokarrom Hossain",
              universityId: "stamford-university-bangladesh",
              universityName: "Stamford University Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Adnan Anwar",
              universityId: "university-of-asia-pacific",
              universityName: "University of Asia Pacific",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icacte.2010.5579624"
        },
        {
          id: "gs-43",
          title: "Application Challenges of Underwater Vision",
          year: 2017,
          citations: 19,
          venue: "Computer Vision in Vehicle Technology: Land, Sea & Air",
          quartile: "Unranked",
          type: "Book Chapter",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1002/9781118868065.ch7",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Campos",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Nat\xE0lia Hurt\xF3s",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Prados",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Tudor Nicosevici",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Arma\u011Fan Elibol",
              universityId: "y-ld-z-technical-university",
              universityName: "Y\u0131ld\u0131z Technical University",
              city: "Istanbul",
              country: "T\xFCrkiye",
              countryCode: "TR",
              continent: "Europe",
              lat: 41.01383972167969,
              lng: 28.94965934753418,
              isHomeInstitution: false
            },
            {
              name: "L\xE1szl\xF3 Neumann",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Javier Escartin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Javier Escartin",
              universityId: "institut-de-physique-du-globe-de-paris",
              universityName: "Institut de physique du globe de Paris",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1002/9781118868065.ch7"
        },
        {
          id: "gs-44",
          title: "Design and comparative analysis of memristor-based transistor-less combinational logic circuits",
          year: 2022,
          citations: 18,
          venue: "International Journal of Electronics",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1080/00207217.2021.1966672",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Shakib Ibne Ashrafi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Syed Iftekhar Ali",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1080/00207217.2021.1966672"
        },
        {
          id: "gs-47",
          title: "Abnormal Node Detection in Wireless Sensor Network by Pair Based Approach using IDS Secure Routing Methodology",
          year: 2008,
          citations: 17,
          venue: "International Journal of Computer Science and Network Security",
          quartile: "Q4",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&pagesize=100&citation_for_view=be8uiCkAAAAJ:7BrZ7Jt4UNcC",
          coAuthors: [
            {
              name: "RA Khandakar",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MSMMAA Kabir Ahmed",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "oa-156",
          title: "Optimizing photovoltaic arrays: A tested dataset of newly manufactured PV modules for data-driven analysis and algorithm development",
          year: 2024,
          citations: 17,
          venue: "Data in Brief",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: true,
          doi: "10.1016/j.dib.2024.110482",
          url: "https://doi.org/10.1016/j.dib.2024.110482",
          coAuthors: [
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohd Shawal Jadin",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Zinat Sultana",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-48",
          title: "The Effects of Non-Uniformly-Aged Photovoltaic Array on Mismatch Power Loss: A Practical Investigation towards Novel Hybrid Array Configurations",
          year: 2023,
          citations: 16,
          venue: "Sustainability",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/su151713153",
          coAuthors: [
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Zubaeer Bin Shams",
              universityId: "sonargaon-university",
              universityName: "Sonargaon University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/su151713153"
        },
        {
          id: "gs-50",
          title: "Characterizing the Aging Process of the Human Eye: Tear Evaporation, Fluid Dynamics, Blood Flow, and Metabolism\u2010Based Comparative Study",
          year: 2022,
          citations: 15,
          venue: "BioMed Research International",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1155/2022/2805402",
          coAuthors: [
            {
              name: "Md. Ashiqur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mamun Rabbani",
              universityId: "university-of-dhaka",
              universityName: "University of Dhaka",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Aminul Islam",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.1155/2022/2805402"
        },
        {
          id: "oa-157",
          title: "Electrical experimental data collection of polycrystalline and monocrystalline photovoltaic modules in an indoor environment using artificial sun simulator",
          year: 2022,
          citations: 15,
          venue: "Data in Brief",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: true,
          doi: "10.1016/j.dib.2022.108389",
          url: "https://doi.org/10.1016/j.dib.2022.108389",
          coAuthors: [
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Kamrozzaman Kiron",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-51",
          title: "Energy and exergy-based efficiency, sustainability and economic assessment towards improved energy management of a thermal power plant: a case study",
          year: 2023,
          citations: 14,
          venue: "Sustainability",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/su15065452",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sameya Afrin July",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mamun Rabbani",
              universityId: "university-of-dhaka",
              universityName: "University of Dhaka",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Shafrida Sahrani",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mahidur R. Sarker",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Shahrial Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/su15065452"
        },
        {
          id: "gs-52",
          title: "Soil impact on photovoltaic performance: a laboratory-based investigation",
          year: 2022,
          citations: 14,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103323",
          coAuthors: [
            {
              name: "Jubayed Hossain Turag",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Amdadull Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Naim Al Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103323"
        },
        {
          id: "gs-53",
          title: "Experimental analysis of the old solar module performance degradation under outdoor weather conditions in bangladesh: a visual and electrical investigation",
          year: 2024,
          citations: 13,
          venue: "2024 IEEE International Conference on Power, Electrical, Electronics and \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peeiacon63629.2024.10800401",
          coAuthors: [
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahariar Ahmed Himo",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peeiacon63629.2024.10800401"
        },
        {
          id: "gs-54",
          title: "An analysis and modeling of the class-e inverter for zvs/zvds at any duty ratio with high input ripple current",
          year: 2021,
          citations: 13,
          venue: "Electronics",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/electronics10111312",
          coAuthors: [
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Monirujjaman Khan",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Aminul Islam",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Jubaer Ahmed",
              universityId: "swinburne-university-of-technology-sarawak-campus",
              universityName: "Swinburne University of Technology Sarawak Campus",
              city: "Kuching",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 1.55,
              lng: 110.33333,
              isHomeInstitution: false
            },
            {
              name: "M. Saad Bin Arif",
              universityId: "aligarh-muslim-university",
              universityName: "Aligarh Muslim University",
              city: "Aligarh",
              country: "India",
              countryCode: "IN",
              continent: "Asia",
              lat: 27.88145,
              lng: 78.07464,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ashraf Siddiquee",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/electronics10111312"
        },
        {
          id: "gs-55",
          title: "Comparative analysis of PV simulation software by analytic hierarchy process",
          year: 2023,
          citations: 12,
          venue: "2023 10th IEEE International Conference on Power Systems (ICPS)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icps60393.2023.10428818",
          coAuthors: [
            {
              name: "Md Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Zia Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Balakumar Muniandi",
              universityId: "lawrence-technological-university",
              universityName: "Lawrence Technological University",
              city: "Southfield",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 42.47472381591797,
              lng: -83.24888610839844,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashiqur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Tuhibur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icps60393.2023.10428818"
        },
        {
          id: "gs-56",
          title: "RIIG modeled WCP image-based CNN Architecture and feature-based approach in breast tumor classification from B-Mode Ultrasound",
          year: 2021,
          citations: 12,
          venue: "Applied Sciences",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/app112412138",
          coAuthors: [
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammed Imamul Hassan Bhuiyan",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Sayed Tanveer",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/app112412138"
        },
        {
          id: "gs-57",
          title: "Development of real time Face detection system using Haar like features and Adaboost algorithm",
          year: 2010,
          citations: 12,
          venue: "International Journal of Computer Science and Network Security",
          quartile: "Q4",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&pagesize=100&citation_for_view=be8uiCkAAAAJ:d1gkVwhDpl0C",
          coAuthors: [
            {
              name: "MMN Arefin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MN Ambia",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "SA Haque",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "T Ahammad",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "oa-158",
          title: "Electrical data of 10W, 40W, 80W, and 250W photovoltaic modules under the aging condition: Tested by a Solar Manufacturer Company in Bangladesh",
          year: 2023,
          citations: 12,
          venue: "Data in Brief",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: true,
          doi: "10.1016/j.dib.2023.108989",
          url: "https://doi.org/10.1016/j.dib.2023.108989",
          coAuthors: [
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-58",
          title: "A Novel Family of Class EF nm and E/F nm Inverter for Improved Efficiency",
          year: 2020,
          citations: 10,
          venue: "2020 2nd International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti50764.2020.9350444",
          coAuthors: [
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Monirujjaman Khan",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti50764.2020.9350444"
        },
        {
          id: "gs-59",
          title: "Parametric image-based breast tumor classification using convolutional neural network in the contourlet transform domain",
          year: 2020,
          citations: 10,
          venue: "2020 11th International Conference on Electrical and Computer Engineering \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icece51571.2020.9393091",
          coAuthors: [
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sayed Tanveer",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammed Imamul Hassan Bhuiyan",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icece51571.2020.9393091"
        },
        {
          id: "gs-61",
          title: "Reducing levelized cost of energy using gas generator in off-grid wind-PV hybrid system",
          year: 2021,
          citations: 9,
          venue: "2021 3rd International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti53101.2021.9732541",
          coAuthors: [
            {
              name: "Md. Touhidul Imam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti53101.2021.9732541"
        },
        {
          id: "gs-62",
          title: "FastSME: faster and smoother manifold extraction from 3D stack",
          year: 2018,
          citations: 9,
          venue: "Proceedings of the IEEE Conference on Computer Vision and Pattern \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/cvprw.2018.00305",
          coAuthors: [
            {
              name: "Sreetama Basu",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Elton Rexhepaj",
              universityId: "institut-curie",
              universityName: "Institut Curie",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rasmus R. Paulsen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/cvprw.2018.00305"
        },
        {
          id: "gs-63",
          title: "Exploring CMOS Technology Impact on Static Random Access Memory (SRAM): A Performance Assessment",
          year: 2025,
          citations: 8,
          venue: "2025 International Conference on Electrical, Computer and Communication \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/ecce64574.2025.11013917",
          coAuthors: [
            {
              name: "M. R. Robin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Rashedul Islam Rashed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Shakib Ibne Ashrafi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/ecce64574.2025.11013917"
        },
        {
          id: "gs-64",
          title: "Harnessing waterbodies in Dhaka: exploring the feasibility of floating solar PV to alleviate the energy crisis in Bangladesh",
          year: 2023,
          citations: 8,
          venue: "2023 5th International Conference on Sustainable Technologies for Industry 5 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti59863.2023.10464785",
          coAuthors: [
            {
              name: "Md. Imamul Islam",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Mohd Shawal Jadin",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Naiem-Ur-Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Golam Mohiuddin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti59863.2023.10464785"
        },
        {
          id: "gs-65",
          title: "A 1kW transformerless inverter with a microcontroller-based battery charging system for off-grid photovoltaic modules",
          year: 2022,
          citations: 8,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103257",
          coAuthors: [
            {
              name: "Razibul Awal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Tuhibur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103257"
        },
        {
          id: "gs-66",
          title: "A comparative performance analysis of zero voltage switching class e and selected enhanced class E inverters",
          year: 2021,
          citations: 8,
          venue: "Electronics",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/electronics10182226",
          coAuthors: [
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Kazi Md Shahnawaz Habib Sourov",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Mahadul Islam",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Aminul Islam",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Mamun Rabbani",
              universityId: "university-of-dhaka",
              universityName: "University of Dhaka",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Rasidul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Monirujjaman Khan",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/electronics10182226"
        },
        {
          id: "gs-67",
          title: "Enhanced energy savings in indoor environments with effective daylight utilization and area segregation",
          year: 2020,
          citations: 8,
          venue: "Symmetry",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/sym12081313",
          coAuthors: [
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Aminul Islam",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Yusri Hassan",
              universityId: "university-of-technology-malaysia",
              universityName: "University of Technology Malaysia",
              city: "Johor Bahru",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 1.4655,
              lng: 103.7578,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/sym12081313"
        },
        {
          id: "gs-68",
          title: "Automated detection of underwater military munitions using fusion of 2D and 2.5 D features from optical imagery",
          year: 2014,
          citations: 8,
          venue: "Marine Technology Society Journal",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.4031/mtsj.48.4.7",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Campos",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Arthur C. R. Gleason",
              universityId: "university-of-miami",
              universityName: "University of Miami",
              city: "Coral Gables",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 25.72149,
              lng: -80.26838,
              isHomeInstitution: false
            },
            {
              name: "Brooke Gintert",
              universityId: "university-of-miami",
              universityName: "University of Miami",
              city: "Coral Gables",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 25.72149,
              lng: -80.26838,
              isHomeInstitution: false
            }
          ],
          doi: "10.4031/mtsj.48.4.7"
        },
        {
          id: "gs-69",
          title: "Comparative evaluation of memristor-based compact 4T2M SRAM with different memristor models",
          year: 2024,
          citations: 7,
          venue: "International Journal of Electronics Letters",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1080/21681724.2023.2210295",
          coAuthors: [
            {
              name: "Md. Shakib Ibne Ashrafi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Syed Iftekhar Ali",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1080/21681724.2023.2210295"
        },
        {
          id: "gs-70",
          title: "Numerical simulation and analysis of the temporal concentration of timolol after topical administration in the human eye",
          year: 2022,
          citations: 7,
          venue: "International Journal of Thermofluids",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.ijft.2022.100251",
          coAuthors: [
            {
              name: "Md. Ashiqur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Hasan Jamil Apon",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Mamun Rabbani",
              universityId: "university-of-dhaka",
              universityName: "University of Dhaka",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.ijft.2022.100251"
        },
        {
          id: "gs-71",
          title: "Improved Fake News Detection Method based on Deep Learning and Comparative Analysis with other Machine Learning approaches",
          year: 2022,
          citations: 7,
          venue: "International Conference on Engineering and Emerging Technologies (ICEET)",
          quartile: "Unranked",
          type: "Preprint",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iceet56468.2022.10007214",
          coAuthors: [
            {
              name: "Razib Hayat Khan",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "M. M. Mahbubul Syeed",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Rakib Ul Haque",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Faisal Uddin",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iceet56468.2022.10007214"
        },
        {
          id: "gs-73",
          title: "Geostatistics for context-aware image classification",
          year: 2015,
          citations: 7,
          venue: "International Conference on Computer Vision Systems",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1007/978-3-319-20904-3_22",
          coAuthors: [
            {
              name: "Felipe Codevilla",
              universityId: "universidade-federal-do-rio-grande",
              universityName: "Universidade Federal do Rio Grande",
              city: "Rio Grande",
              country: "Brazil",
              countryCode: "BR",
              continent: "South America",
              lat: -32.035,
              lng: -52.09861,
              isHomeInstitution: false
            },
            {
              name: "S\xEDlvia Silva da Costa Botelho",
              universityId: "universidade-federal-do-rio-grande",
              universityName: "Universidade Federal do Rio Grande",
              city: "Rio Grande",
              country: "Brazil",
              countryCode: "BR",
              continent: "South America",
              lat: -32.035,
              lng: -52.09861,
              isHomeInstitution: false
            },
            {
              name: "Nelson Duarte",
              universityId: "universidade-federal-do-rio-grande",
              universityName: "Universidade Federal do Rio Grande",
              city: "Rio Grande",
              country: "Brazil",
              countryCode: "BR",
              continent: "South America",
              lat: -32.035,
              lng: -52.09861,
              isHomeInstitution: false
            },
            {
              name: "Samuel J. Purkis",
              universityId: "nova-southeastern-university",
              universityName: "Nova Southeastern University",
              city: "Fort Lauderdale",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 26.12231,
              lng: -80.14338,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            }
          ],
          doi: "10.1007/978-3-319-20904-3_22"
        },
        {
          id: "gs-74",
          title: "Low cost design of a PC based integrated system for signal measurement and generation using microcontroller",
          year: 2010,
          citations: 7,
          venue: "2010 2nd International Conference on Signal Processing Systems 3, V3-747-V3-751",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icsps.2010.5555769",
          coAuthors: [
            {
              name: "Mir Mohammad Nazmul Arefin",
              universityId: "stamford-university-bangladesh",
              universityName: "Stamford University Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mir Nahidul Ambia",
              universityId: "eastern-university",
              universityName: "Eastern University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.742799758911133,
              lng: 90.38059997558594,
              isHomeInstitution: false
            },
            {
              name: "Tanvir Ahammad",
              universityId: "stamford-university-bangladesh",
              universityName: "Stamford University Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icsps.2010.5555769"
        },
        {
          id: "gs-75",
          title: "Deep learning assisted anomaly detection support system of solar power plant with infrared imagery",
          year: 2023,
          citations: 6,
          venue: "2023 5th International Conference on Sustainable Technologies for Industry 5 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti59863.2023.10464720",
          coAuthors: [
            {
              name: "Md. Ashif Mahbub",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abu Hanif Emon",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasib Mahbub",
              universityId: "bangladesh-army-university-of-science-and-technology",
              universityName: "Bangladesh Army University of Science and Technology",
              city: "Saidpur",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 25.809999465942383,
              lng: 88.91000366210938,
              isHomeInstitution: false
            },
            {
              name: "Nimur Rahman",
              universityId: "university-of-dhaka",
              universityName: "University of Dhaka",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Nimur Rahman",
              universityId: "faridpur-engineering-college",
              universityName: "Faridpur Engineering College",
              city: "Far\u012Bdpur",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.60612,
              lng: 89.84064,
              isHomeInstitution: false
            },
            {
              name: "Sakib Abdul Ahad",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti59863.2023.10464720"
        },
        {
          id: "gs-78",
          title: "Experimental investigation of PV array interconnection topologies at nonuniform aging condition for power maximization",
          year: 2019,
          citations: 6,
          venue: "GUB Journal of Science and Engineering",
          quartile: "Q3",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103307",
          coAuthors: [
            {
              name: "Tuhibur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shyful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sahin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Razibul Awal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103307"
        },
        {
          id: "gs-80",
          title: "Energy conversion and management: X optimizing energy solutions: A techno-economic analysis of solar-wind hybrid power generation in the coastal regions of Bangladesh",
          year: 2024,
          citations: 5,
          venue: "Energy Conversion and Management: X",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.ecmx.2024.100605",
          coAuthors: [
            {
              name: "Md. Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.ecmx.2024.100605"
        },
        {
          id: "gs-81",
          title: "Performance analysis of a solar panel cleaning autonomous robot (SPCR) with comparative study",
          year: 2023,
          citations: 5,
          venue: "2023 26th International Conference on Computer and Information Technology \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccit60459.2023.10440987",
          coAuthors: [
            {
              name: "Sourav Barua",
              universityId: "ahsanullah-university-of-science-and-technology",
              universityName: "Ahsanullah University of Science and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ashrafun Nushra Oishi",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Meer Shadman Shafkat Tanjim",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Istiac Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccit60459.2023.10440987"
        },
        {
          id: "gs-82",
          title: "ul Haq, MA; Shihavuddin, ASM; Jadin, MS Feasibility analysis of floating photovoltaic power plant in Bangladesh: A case study in Hatirjheel Lake, Dhaka",
          year: 2023,
          citations: 5,
          venue: "Sustainable Energy Technologies and Assessments",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.seta.2022.102994",
          coAuthors: [
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohd Shawal Jadin",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.seta.2022.102994"
        },
        {
          id: "gs-84",
          title: "Solar Battery Charging Station for Electric Vehicles: Part I-Screening, Modeling, and Feasibility Analysis",
          year: 2022,
          citations: 5,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103346",
          coAuthors: [
            {
              name: "Md. Sazal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Nazmul Akter Shahin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Shakib Ibne Ashrafi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103346"
        },
        {
          id: "gs-85",
          title: "MRI based automated detection of brain tumor using DWT, GLCM, PCA, ensemble of SVM and PNN in sequence",
          year: 2022,
          citations: 5,
          venue: "International Conference on Machine Intelligence and Emerging Technologies \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1007/978-3-031-34619-4_22",
          coAuthors: [
            {
              name: "Md. Sakib Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sajib Hossain",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Nazmul Haque",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M. M. Mahbubul Syeed",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1007/978-3-031-34619-4_22"
        },
        {
          id: "gs-87",
          title: "Redes Neuronales Convolucionales para Una Clasificacion Precisa de Im\xE1genes de Corales",
          year: 2018,
          citations: 5,
          venue: "CAEPIA",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://dialnet.unirioja.es/servlet/articulo?codigo=7373965",
          coAuthors: [
            {
              name: "Anabel G\xF3mez-R\xEDos",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Siham Tabik",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Juli\xE1n Luengo",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Francisco Herrera",
              universityId: "universidad-de-granada",
              universityName: "Universidad de Granada",
              city: "Granada",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 37.18817,
              lng: -3.60667,
              isHomeInstitution: false
            },
            {
              name: "Bartosz Krawczyk",
              universityId: "virginia-commonwealth-university",
              universityName: "Virginia Commonwealth University",
              city: "Richmond",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 37.55376,
              lng: -77.46026,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-89",
          title: "Optical methods to monitor temporal changes at the seafloor: The Lucky Strike deep-sea hydrothermal vent field (Mid-Atlantic Ridge)",
          year: 2013,
          citations: 5,
          venue: "2013 IEEE International Underwater Technology Symposium (UT)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/ut.2013.6519838",
          coAuthors: [
            {
              name: "Javier Escartin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Javier Escartin",
              universityId: "institut-de-physique-du-globe-de-paris",
              universityName: "Institut de physique du globe de Paris",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Thibaut Barreyre",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Thibaut Barreyre",
              universityId: "institut-de-physique-du-globe-de-paris",
              universityName: "Institut de physique du globe de Paris",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Mathilde Cannat",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Mathilde Cannat",
              universityId: "institut-de-physique-du-globe-de-paris",
              universityName: "Institut de physique du globe de Paris",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "E. L. Mittelstaedt",
              universityId: "university-of-idaho",
              universityName: "University of Idaho",
              city: "Moscow",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 46.732391357421875,
              lng: -117.00016784667969,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/ut.2013.6519838"
        },
        {
          id: "gs-90",
          title: "mTOR controls ependymal cell differentiation by targeting the alternative cell cycle and centrosomal proteins",
          year: 2025,
          citations: 4,
          venue: "EMBO Reports",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1038/s44319-025-00460-2",
          coAuthors: [
            {
              name: "Alexia Bankol\xE9",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Bankol\xE9",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Bankol\xE9",
              universityId: "universit-paris-cit",
              universityName: "Universit\xE9 Paris Cit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alexia Bankol\xE9",
              universityId: "institut-necker-enfants-malades",
              universityName: "Institut Necker Enfants Malades",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ayush Srivastava",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ayush Srivastava",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ayush Srivastava",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ayush Srivastava",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Khaled Tighanimine",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Khaled Tighanimine",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Khaled Tighanimine",
              universityId: "universit-paris-cit",
              universityName: "Universit\xE9 Paris Cit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Khaled Tighanimine",
              universityId: "institut-necker-enfants-malades",
              universityName: "Institut Necker Enfants Malades",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Marion Faucourt",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Vonda Koka",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Vonda Koka",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Vonda Koka",
              universityId: "universit-paris-cit",
              universityName: "Universit\xE9 Paris Cit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Vonda Koka",
              universityId: "institut-necker-enfants-malades",
              universityName: "Institut Necker Enfants Malades",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Solene Weill",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Solene Weill",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Solene Weill",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Solene Weill",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ivan Nemazanyy",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ivan Nemazanyy",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ivan Nemazanyy",
              universityId: "structure-f-d-rative-de-recherche-necker",
              universityName: "Structure f\xE9d\xE9rative de recherche Necker",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alissa J. Nelson",
              universityId: "cell-signaling-technology-united-states",
              universityName: "Cell Signaling Technology (United States)",
              city: "Danvers",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 42.856685638427734,
              lng: -71.15058135986328,
              isHomeInstitution: false
            },
            {
              name: "Matthew P. Stokes",
              universityId: "cell-signaling-technology-united-states",
              universityName: "Cell Signaling Technology (United States)",
              city: "Danvers",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 42.856685638427734,
              lng: -71.15058135986328,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Delgehyr",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Auguste Genovesio",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Alice Meunier",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Stefano Fumagalli",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Stefano Fumagalli",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Stefano Fumagalli",
              universityId: "universit-paris-cit",
              universityName: "Universit\xE9 Paris Cit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Stefano Fumagalli",
              universityId: "institut-necker-enfants-malades",
              universityName: "Institut Necker Enfants Malades",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Mario Pende",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Mario Pende",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Mario Pende",
              universityId: "universit-paris-cit",
              universityName: "Universit\xE9 Paris Cit\xE9",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Mario Pende",
              universityId: "institut-necker-enfants-malades",
              universityName: "Institut Necker Enfants Malades",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Nathalie Spassky",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ],
          doi: "10.1038/s44319-025-00460-2"
        },
        {
          id: "gs-91",
          title: "Microcontroller based pack to cell active cell balancing for battery management system (BMS) using DC-DC fly-back converter",
          year: 2024,
          citations: 4,
          venue: "2024 6th International Conference on Electrical Engineering and Information \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iceeict62016.2024.10534326",
          coAuthors: [
            {
              name: "Shahariar Ahmed Himo",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M T Hasan Amin",
              universityId: "university-of-houston",
              universityName: "University of Houston",
              city: "Houston",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 29.763280868530273,
              lng: -95.36327362060547,
              isHomeInstitution: false
            },
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Mozammal Hoque",
              universityId: "university-of-houston",
              universityName: "University of Houston",
              city: "Houston",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 29.763280868530273,
              lng: -95.36327362060547,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iceeict62016.2024.10534326"
        },
        {
          id: "gs-92",
          title: "Kahoot A Game-Based Learning Tool in Online Class for Effective Engagement and Formative Assessment",
          year: 2024,
          citations: 4,
          venue: "Charles Sturt University Research Output (CRO)",
          quartile: "Unranked",
          type: "Preprint",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://researchoutput.csu.edu.au/en/publications/ca42273d-224c-45fc-9925-eb9b16e13b47",
          coAuthors: [
            {
              name: "Arifa Rahman",
              universityId: "charles-sturt-university",
              universityName: "Charles Sturt University",
              city: "Bathurst",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -33.41665,
              lng: 149.5806,
              isHomeInstitution: false
            },
            {
              name: "Md Hafiz Sikder",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Al Zubayer Rony",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Md. Golam Samdani Fakir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-93",
          title: "Interpretability-guided human feedback during neural network training",
          year: 2023,
          citations: 4,
          venue: "Iberian Conference on Pattern Recognition and Image Analysis",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1007/978-3-031-36616-1_22",
          coAuthors: [
            {
              name: "Pedro Serrano e Silva",
              universityId: "universidade-do-porto",
              universityName: "Universidade do Porto",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Pedro Serrano e Silva",
              universityId: "inesc-tec",
              universityName: "INESC TEC",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Ricardo Cruz",
              universityId: "universidade-do-porto",
              universityName: "Universidade do Porto",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Ricardo Cruz",
              universityId: "inesc-tec",
              universityName: "INESC TEC",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Tiago Gon\xE7alves",
              universityId: "universidade-do-porto",
              universityName: "Universidade do Porto",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Tiago Gon\xE7alves",
              universityId: "inesc-tec",
              universityName: "INESC TEC",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            }
          ],
          doi: "10.1007/978-3-031-36616-1_22"
        },
        {
          id: "gs-94",
          title: "Solar Charging Station for Easy Bikes in Bangladesh: Validation and Post-Model Evaluation",
          year: 2023,
          citations: 4,
          venue: "GUB Journal of Science and Engineering",
          quartile: "Q3",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3329/gubjse.v10i1.74936",
          coAuthors: [
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ordatun Jannat",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3329/gubjse.v10i1.74936"
        },
        {
          id: "gs-96",
          title: "Cascaded 3-stage nuclei segmentation using U-net, Faster-RCNN and segnet for higher precision",
          year: 2021,
          citations: 4,
          venue: "2021 3rd International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti53101.2021.9732598",
          coAuthors: [
            {
              name: "Mohammad Kamrozzaman Kiron",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti53101.2021.9732598"
        },
        {
          id: "gs-99",
          title: "Biometrics Under Biomedical Considerations",
          year: 2019,
          citations: 4,
          venue: "SpringerPlus",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&pagesize=100&citation_for_view=be8uiCkAAAAJ:BOlwja0KXvYC",
          coAuthors: [
            {
              name: "Baumann",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Nait-Ali",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-101",
          title: "Using catadioptric sensor to obtain image of the inner surface of a pipe and detection and analysis of faults by image processing",
          year: 2011,
          citations: 4,
          venue: "14th International Conference on Computer and Information Technology (ICCIT \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccitechn.2011.6164860",
          coAuthors: [
            {
              name: "Md. Rokibul Islam",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Abu Naser",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Rezaul Hasan",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Azizul Hoque",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccitechn.2011.6164860"
        },
        {
          id: "gs-104",
          title: "Contourlet Transformed Nakagami Image-based Breast Tumor Classification Using Deep CNN",
          year: 2022,
          citations: 3,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103332",
          coAuthors: [
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammed Imamul Hassan Bhuiyan",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Alfew Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Abdul Aziz Prodhan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Faysal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103332"
        },
        {
          id: "gs-106",
          title: "Harmonic Reduction of Cascaded H-Bridge Multilevel Inverter Using Advanced Level Shifted Pulse Width Modulation Technique",
          year: 2021,
          citations: 3,
          venue: "2021 International Conference on Electronics, Communications and Information \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icecit54077.2021.9641219",
          coAuthors: [
            {
              name: "Mohammad Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fayzur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sourav Barua",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icecit54077.2021.9641219"
        },
        {
          id: "gs-108",
          title: "A Class E/F 3 based 10W LED Driver with ZVS Capability",
          year: 2020,
          citations: 3,
          venue: "2020 2nd International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti50764.2020.9350460",
          coAuthors: [
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Monirujjaman Khan",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti50764.2020.9350460"
        },
        {
          id: "gs-119",
          title: "Microgrid Dynamics Control: GA-Optimized LQR vs. ILQR Controller Comparison",
          year: 2024,
          citations: 2,
          venue: "2024 IEEE International Conference on Power, Electrical, Electronics and \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peeiacon63629.2024.10800355",
          coAuthors: [
            {
              name: "Md. Takvir Anam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fahim Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peeiacon63629.2024.10800355"
        },
        {
          id: "gs-120",
          title: "Advancing Communication Systems: A Novel Low-Power ADC Design in 45nm CMOS Technology",
          year: 2024,
          citations: 2,
          venue: "2024 IEEE International Conference on Power, Electrical, Electronics and \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peeiacon63629.2024.10800457",
          coAuthors: [
            {
              name: "Siful Islam Pranto",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdullah Al Mahfuz",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peeiacon63629.2024.10800457"
        },
        {
          id: "gs-121",
          title: "Maruf, ASM Shihavuddin, Optimizing energy solutions: A techno-economic analysis of solar-wind hybrid power generation in the coastal regions of Bangladesh",
          year: 2024,
          citations: 2,
          venue: "Energy Conversion and Management: X",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.ecmx.2024.100605",
          coAuthors: [
            {
              name: "Md. Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Masroor Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.ecmx.2024.100605"
        },
        {
          id: "gs-122",
          title: "Analysis of Mismatch Power Loss and Degradation in Aged PV Modules and Arrays: Insights from an Indoor Experimental Investigation",
          year: 2023,
          citations: 2,
          venue: "International Conference on Electrical, Control & Computer Engineering",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3329/gubjse.v6i1.52049",
          coAuthors: [
            {
              name: "AA Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "MAU Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ruhul Amin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "KK Islam",
              universityId: "uttara-university",
              universityName: "Uttara University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.8703670501709,
              lng: 90.40263366699219,
              isHomeInstitution: false
            }
          ],
          doi: "10.3329/gubjse.v6i1.52049"
        },
        {
          id: "gs-123",
          title: "Machine Intelligence and Emerging Technologies: First International Conference, MIET 2022, Noakhali, Bangladesh, September 23-25, 2022, Proceedings, Part II",
          year: 2023,
          citations: 2,
          venue: "Springer Nature",
          quartile: "Unranked",
          type: "Book Chapter",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:X0DADzN9RKwC",
          coAuthors: [
            {
              name: "MS Satu",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MA Moni",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MS Kaiser",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MS Arefin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-124",
          title: "Abordagens de Intelig\xEAncia Artificial para Sistemas Avan\xE7ados de Gest\xE3o de Baterias em Aplica\xE7\xF5es de Ve\xEDculos El\xE9tricos: Uma An\xE1lise Estat\xEDstica para Futuras Oportunidades de \u2026",
          year: 2023,
          citations: 2,
          venue: "Vehicles",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:h168fVGZblEC",
          coAuthors: [
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MS Miah",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "T Jamal",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "T Rahman",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "S Ansari",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MS Rahman",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-126",
          title: "Design and implementation of a sine-wave inverter using microcontroller with modified pulse width modulation technique",
          year: 2022,
          citations: 2,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103308",
          coAuthors: [
            {
              name: "Razibul Awal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fayzur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ali Hasan Ahmad",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ahsanul Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sameya Afrin July",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103308"
        },
        {
          id: "gs-127",
          title: "Shihavuddin, ASM, Hannan, MA, Muttaqi, KM and ASM Hussain,\u201CDeep learning enabled state of charge, state of health and remaining useful life estimation for smart battery \u2026",
          year: 2022,
          citations: 2,
          venue: "Journal of Energy Storage",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.est.2022.105752",
          coAuthors: [
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shaheer Ansari",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            },
            {
              name: "Md. Sazal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sazal Miah",
              universityId: "asian-institute-of-technology",
              universityName: "Asian Institute of Technology",
              city: "Pathum Thani",
              country: "Thailand",
              countryCode: "TH",
              continent: "Asia",
              lat: 14.01346,
              lng: 100.53049,
              isHomeInstitution: false
            },
            {
              name: "Sheikh Tanzim Meraj",
              universityId: "deakin-university",
              universityName: "Deakin University",
              city: "Burwood",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -37.84978,
              lng: 145.11901,
              isHomeInstitution: false
            },
            {
              name: "Kamrul Hasan",
              universityId: "universiti-teknologi-mara",
              universityName: "Universiti Teknologi MARA",
              city: "Shah Alam",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.08507,
              lng: 101.53281,
              isHomeInstitution: false
            },
            {
              name: "M. A. Hannan",
              universityId: "universiti-tenaga-nasional",
              universityName: "Universiti Tenaga Nasional",
              city: "Kuala Selangor",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.35,
              lng: 101.25,
              isHomeInstitution: false
            },
            {
              name: "Kashem Mohammad Muttaqi",
              universityId: "university-of-wollongong",
              universityName: "University of Wollongong",
              city: "Wollongong",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -34.42399978637695,
              lng: 150.89344787597656,
              isHomeInstitution: false
            },
            {
              name: "Aini Hussain",
              universityId: "national-university-of-malaysia",
              universityName: "National University of Malaysia",
              city: "Bangi",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 2.9,
              lng: 101.78333,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.est.2022.105752"
        },
        {
          id: "gs-128",
          title: "Tumor detection by rectangular microstrip patch antenna",
          year: 2021,
          citations: 2,
          venue: "2021 3rd International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti53101.2021.9732605",
          coAuthors: [
            {
              name: "Anis Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Nurunnabi Mollah",
              universityId: "khulna-university-of-engineering-and-technology",
              universityName: "Khulna University of Engineering and Technology",
              city: "Khulna",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.809789657592773,
              lng: 89.56439208984375,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti53101.2021.9732605"
        },
        {
          id: "gs-142",
          title: "ul, Dey, SK, Al Mansur, A., & Shihavuddin, ASM (2020). Adaptation for sustainable implementation of Smart Grid in developing countries like Bangladesh. Energy Reports, 6, 2520\u20132530",
          year: 2020,
          citations: 2,
          venue: "Energy Reports",
          quartile: "Unranked",
          type: "Preprint",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.egyr.2020.09.010",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Asif ul Haq",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Suman Kumar Dey",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.egyr.2020.09.010"
        },
        {
          id: "gs-132",
          title: "Andre Brogaard Riis, N., Branner, K., and",
          year: 2019,
          citations: 2,
          venue: "Academic Venue",
          quartile: "Unranked",
          type: "Preprint",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:natZJ_-F0IUC",
          coAuthors: [
            {
              name: "X Chen",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "V Fedorov",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "CA Nymark",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "PR Reinhold",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-135",
          title: "Biometrics from Cellular Imaging",
          year: 2019,
          citations: 2,
          venue: "Biometrics under Biomedical Considerations",
          quartile: "Unranked",
          type: "Book Chapter",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1007/978-981-13-1144-4_11",
          coAuthors: [
            {
              name: "Ahlem Othmani",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ahlem Othmani",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ahlem Othmani",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ahlem Othmani",
              universityId: "paris-est-sup",
              universityName: "Paris-Est Sup",
              city: "Champs-sur-Marne",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85,
              lng: 2.6,
              isHomeInstitution: false
            },
            {
              name: "Ahlem Othmani",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Ahlem Othmani",
              universityId: "laboratoire-images-signaux-et-syst-mes-intelligents",
              universityName: "Laboratoire Images, signaux et syst\xE8mes intelligents",
              city: "Vitry-sur-Seine",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.78715896606445,
              lng: 2.403320074081421,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Sreetama Basu",
              universityId: "bioinformatics-institute",
              universityName: "Bioinformatics Institute",
              city: "Singapore",
              country: "Singapore",
              countryCode: "SG",
              continent: "Asia",
              lat: 1.2896699905395508,
              lng: 103.85006713867188,
              isHomeInstitution: false
            },
            {
              name: "Amulya Nidhi Shrivastava",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Amulya Nidhi Shrivastava",
              universityId: "institut-des-neurosciences-paris-saclay",
              universityName: "Institut des Neurosciences Paris-Saclay",
              city: "Saclay",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.7326,
              lng: 2.16923,
              isHomeInstitution: false
            },
            {
              name: "Sinem Aslan",
              universityId: "university-of-milan",
              universityName: "University of Milan",
              city: "Milan",
              country: "Italy",
              countryCode: "IT",
              continent: "Europe",
              lat: 45.46427,
              lng: 9.18951,
              isHomeInstitution: false
            },
            {
              name: "Francesco De Carli",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Francesco De Carli",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Francesco De Carli",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Francesco De Carli",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Francesco De Carli",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Delase Amesefe",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Delase Amesefe",
              universityId: "inserm",
              universityName: "Inserm",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Delase Amesefe",
              universityId: "universit-paris-sciences-et-lettres",
              universityName: "Universit\xE9 Paris Sciences et Lettres",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Delase Amesefe",
              universityId: "cole-normale-sup-rieure-psl",
              universityName: "\xC9cole Normale Sup\xE9rieure - PSL",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Delase Amesefe",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "A. Na\xEFt-Ali",
              universityId: "universit-paris-est-cr-teil",
              universityName: "Universit\xE9 Paris-Est Cr\xE9teil",
              city: "Cr\xE9teil",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.79266,
              lng: 2.46569,
              isHomeInstitution: false
            },
            {
              name: "A. Na\xEFt-Ali",
              universityId: "laboratoire-images-signaux-et-syst-mes-intelligents",
              universityName: "Laboratoire Images, signaux et syst\xE8mes intelligents",
              city: "Vitry-sur-Seine",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.78715896606445,
              lng: 2.403320074081421,
              isHomeInstitution: false
            }
          ],
          doi: "10.1007/978-981-13-1144-4_11"
        },
        {
          id: "gs-149",
          title: "Wind Turbine Maintenance Cost Reduction by Deep Learning Aided Drone Inspection Analysis, 2019",
          year: 2019,
          citations: 2,
          venue: "Energies",
          quartile: "Unranked",
          type: "Preprint",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/en12040676",
          coAuthors: [
            {
              name: "Xiao Dong Chen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Vladimir Fedorov",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Nicolai A. B. Riis",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Anders Nymark Christensen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Kim Branner",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Anders Bjorholm Dahl",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Rasmus R. Paulsen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/en12040676"
        },
        {
          id: "gs-136",
          title: "Computer Vision in Vehicle Technology: Land, Sea & Air",
          year: 2017,
          citations: 2,
          venue: "Computer Vision in Vehicle Technology: Land, Sea, and Air",
          quartile: "Unranked",
          type: "Book Chapter",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://orbit.dtu.dk/en/publications/computer-vision-in-vehicle-technology-land-sea--air(d0c343d1-9d92-4578-b548-1d15218847dc).html",
          coAuthors: [
            {
              name: "Nuno Gracias",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Rafael Garc\xEDa",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Campos",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Nat\xE0lia Hurt\xF3s",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Ricard Prados",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Tudor Nicosevici",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Arma\u011Fan Elibol",
              universityId: "y-ld-z-technical-university",
              universityName: "Y\u0131ld\u0131z Technical University",
              city: "Istanbul",
              country: "T\xFCrkiye",
              countryCode: "TR",
              continent: "Europe",
              lat: 41.01383972167969,
              lng: 28.94965934753418,
              isHomeInstitution: false
            },
            {
              name: "L\xE1szl\xF3 Neumann",
              universityId: "universitat-de-girona",
              universityName: "Universitat de Girona",
              city: "Girona",
              country: "Spain",
              countryCode: "ES",
              continent: "Europe",
              lat: 41.98311,
              lng: 2.82493,
              isHomeInstitution: false
            },
            {
              name: "Javier Escartin",
              universityId: "centre-national-de-la-recherche-scientifique",
              universityName: "Centre National de la Recherche Scientifique",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-137",
          title: "Improved Supervised Classification of Underwater Military Munitions Using Height Features Derived from Optical Imagery",
          year: 2015,
          citations: 2,
          venue: "OCEANS'15 MTS/IEEE Washington",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.23919/oceans.2015.7404580",
          coAuthors: [
            {
              name: "Arthur C. R. Gleason",
              universityId: "university-of-miami",
              universityName: "University of Miami",
              city: "Coral Gables",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 25.72149,
              lng: -80.26838,
              isHomeInstitution: false
            },
            {
              name: "Nuno Gracias",
              universityId: "institut-de-biologie-de-l-cole-normale-sup-rieure",
              universityName: "Institut de Biologie de l'\xC9cole Normale Sup\xE9rieure",
              city: "Paris",
              country: "France",
              countryCode: "FR",
              continent: "Europe",
              lat: 48.85341,
              lng: 2.3488,
              isHomeInstitution: false
            },
            {
              name: "Gregory M. Schultz",
              universityId: "white-river-technologies-united-states",
              universityName: "White River Technologies (United States)",
              city: "Newton",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 42.338294982910156,
              lng: -71.21334075927734,
              isHomeInstitution: false
            },
            {
              name: "Brooke Gintert",
              universityId: "university-of-miami",
              universityName: "University of Miami",
              city: "Coral Gables",
              country: "United States",
              countryCode: "US",
              continent: "North America",
              lat: 25.72149,
              lng: -80.26838,
              isHomeInstitution: false
            }
          ],
          doi: "10.23919/oceans.2015.7404580"
        },
        {
          id: "gs-138",
          title: "Towards autonomous robot operation: Path map generation of an unknown area by a new trapezoidal approximation method using a self guided vehicle and shortest path calculation \u2026",
          year: 2008,
          citations: 2,
          venue: "Pacific Rim International Conference on Artificial Intelligence",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1007/978-3-540-89197-0_54",
          coAuthors: [
            {
              name: "Khandakar Rashed Ahmed",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "M. S. Munir",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashraful Hoque",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "K. K. Islam",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1007/978-3-540-89197-0_54"
        },
        {
          id: "gs-139",
          title: "Micro-controller operated robot using photo sensor guiding system",
          year: 2007,
          citations: 2,
          venue: "1st international conference on control, instrumentation and mechatronics, CIM",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:Ak0FvsSvgGUC",
          coAuthors: [
            {
              name: "NM Fadlullah",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "KK Islam",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "oa-154",
          title: "Analysis of Mismatch Power Loss and Degradation in Aged PV Modules and Arrays: Insights from an Indoor Experimental Investigation",
          year: 2024,
          citations: 2,
          venue: "Lecture notes in electrical engineering",
          quartile: "Unranked",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          doi: "10.1007/978-981-97-3847-2_27",
          url: "https://doi.org/10.1007/978-981-97-3847-2_27",
          coAuthors: [
            {
              name: "Md. Imamul Islam",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohd Shawal Jadin",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-151",
          title: "Glioseg 3D: advancing glioma brain tumor classification & segmentation with 3D MRI data",
          year: 2024,
          citations: 1,
          venue: "2024 IEEE International Conference on Power, Electrical, Electronics and \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peeiacon63629.2024.10800098",
          coAuthors: [
            {
              name: "Razaul Haque Rasham",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Anwar Hossain",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shimul Chandra Das",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peeiacon63629.2024.10800098"
        },
        {
          id: "gs-152",
          title: "Empowering Sustainability: Viability Analysis of a Floating Photovoltaic System at Gulshan Lake",
          year: 2023,
          citations: 1,
          venue: "2023 5th International Conference on Sustainable Technologies for Industry 5 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti59863.2023.10464505",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Farzana Akter Moli",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Nayem Ahmed Noyon",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sameya Afrin July",
              universityId: "khulna-university-of-engineering-and-technology",
              universityName: "Khulna University of Engineering and Technology",
              city: "Khulna",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.809789657592773,
              lng: 89.56439208984375,
              isHomeInstitution: false
            },
            {
              name: "Md. Imamul Islam",
              universityId: "universiti-malaysia-pahang-al-sultan-abdullah",
              universityName: "Universiti Malaysia Pahang Al-Sultan Abdullah",
              city: "Pekan",
              country: "Malaysia",
              countryCode: "MY",
              continent: "Asia",
              lat: 3.483599901199341,
              lng: 103.39959716796875,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti59863.2023.10464505"
        },
        {
          id: "gs-153",
          title: "A comparative analysis on detecting physiological age of Caenorhabditis elegans using deep learning techniques",
          year: 2023,
          citations: 1,
          venue: "2023 5th International Conference on Sustainable Technologies for Industry 5 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti59863.2023.10464456",
          coAuthors: [
            {
              name: "Tanyeem As Safwan",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Apurba Kumar",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Raihanul Karim",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti59863.2023.10464456"
        },
        {
          id: "gs-154",
          title: "The ZVS Class E/F3 Inverter Using Piezoelectric Transformers for Energy Extraction",
          year: 2023,
          citations: 1,
          venue: "Electronics",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3390/electronics12092118",
          coAuthors: [
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M. Saad Bin Arif",
              universityId: "aligarh-muslim-university",
              universityName: "Aligarh Muslim University",
              city: "Aligarh",
              country: "India",
              countryCode: "IN",
              continent: "Asia",
              lat: 27.88145,
              lng: 78.07464,
              isHomeInstitution: false
            },
            {
              name: "Abdul Rauf Bhatti",
              universityId: "government-college-university-faisalabad",
              universityName: "Government College University, Faisalabad",
              city: "Faisalabad",
              country: "Pakistan",
              countryCode: "PK",
              continent: "Asia",
              lat: 31.41554069519043,
              lng: 73.08969116210938,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3390/electronics12092118"
        },
        {
          id: "gs-155",
          title: "Estimating Earth\u2019s Albedo from Moon Images using Random Forest will Enable Climate Change Monitoring",
          year: 2022,
          citations: 1,
          venue: "International Conference on Sustainable Technologies for Industry 5.0 (STI)",
          quartile: "Unranked",
          type: "Preprint",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103334",
          coAuthors: [
            {
              name: "Peter A. Thejll",
              universityId: "danish-meteorological-institute",
              universityName: "Danish Meteorological Institute",
              city: "Copenhagen",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.67594,
              lng: 12.56553,
              isHomeInstitution: false
            },
            {
              name: "Monica Jane Emerson",
              universityId: "novo-nordisk-denmark",
              universityName: "Novo Nordisk (Denmark)",
              city: "Copenhagen",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.67594,
              lng: 12.56553,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103334"
        },
        {
          id: "gs-156",
          title: "Vowel Recognition for Isolated Digit Using Wavelet Transform at Decomposition Level 3",
          year: 2022,
          citations: 1,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103316",
          coAuthors: [
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Shakib Ibne Ashrafi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103316"
        },
        {
          id: "gs-157",
          title: "Cascaded DNNs for detecting the position and orientation of Left Ventricle from 3D CT Scans",
          year: 2022,
          citations: 1,
          venue: "2022 IEEE 14th Image, Video, and Multidimensional Signal Processing Workshop \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/ivmsp54334.2022.9816249",
          coAuthors: [
            {
              name: "Magnus Caspersen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Md. Sayed Tanveer",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M. M. Mahbubul Syeed",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ashraful Amin",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Faisal Uddin",
              universityId: "independent-university-bangladesh",
              universityName: "Independent University, Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/ivmsp54334.2022.9816249"
        },
        {
          id: "gs-159",
          title: "Modeling and Analysis of High Frequency Magnetic Link-Based 11kVAsymmetric 21 level Inverter for Solar Photovoltaic Systems",
          year: 2021,
          citations: 1,
          venue: "2021 IEEE Industrial Electronics and Applications Conference (IEACon)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/ieacon51066.2021.9654658",
          coAuthors: [
            {
              name: "Mohammad Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sourav Barua",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fayzur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/ieacon51066.2021.9654658"
        },
        {
          id: "gs-162",
          title: "Food Depth Estimation Using Low-Cost Mobile-Based System for Real-Time Dietary Assessment",
          year: 2019,
          citations: 1,
          venue: "GUB Journal of Science and Engineering",
          quartile: "Q3",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3329/gubjse.v6i1.52044",
          coAuthors: [
            {
              name: "Dms Zaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashiqur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Jannatul Ferdousy",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.3329/gubjse.v6i1.52044"
        },
        {
          id: "gs-163",
          title: "Can we train a single deep learning model to detect and segment nuclei images acquired with any microscope or staining modality?",
          year: 2018,
          citations: 1,
          venue: "69th Annual Conference of the Nordic Microscopy Society",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://orbit.dtu.dk/files/150263012/Scandem_2018_abstract_Nuclei_detection.pdf",
          coAuthors: [
            {
              name: "Florian Gawrilowicz",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Niels Jeppesen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Rasmus R. Paulsen",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-164",
          title: "Inspection of the Interior Surface of a Cylindrical Pipe by Omnidirectional Image Acquisition System",
          year: 2011,
          citations: 1,
          venue: "Journal of Engineering and Technology",
          quartile: "Q4",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:zYLM7Y9cAGgC",
          coAuthors: [
            {
              name: "MR Islam",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MA Naser",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "SM Ferdous",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MA Hoque",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-165",
          title: "Reverse link performance of a generalized mc-cdma systems for multipath fading channel",
          year: 2008,
          citations: 1,
          venue: "Bangladesh Electronics Society: Rajshahi, Bangladesh",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:BzfGm06jWhQC",
          coAuthors: [
            {
              name: "MRH Khan",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MA Hossain",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "oa-155",
          title: "Curvelet Transformed NIG Image-based Breast Tumor Classification Using Deep Learning",
          year: 2022,
          citations: 1,
          venue: "International Conference on Sustainable Technologies for Industry 5.0 (STI)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          doi: "10.1109/sti56238.2022.10103282",
          url: "https://doi.org/10.1109/sti56238.2022.10103282",
          coAuthors: [
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammed Imamul Hassan Bhuiyan",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Rakibul Hassan Tusar",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mitu Mridha",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sabbir Hossain Shuvo",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-landsat-dib",
          title: "A 25-year Landsat-derived environmental observation dataset for Narayanganj, Bangladesh, 2001\u20132025",
          year: 2026,
          citations: 0,
          venue: "Data in Brief",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: true,
          doi: "10.1016/j.dib.2026.113392",
          url: "https://doi.org/10.1016/j.dib.2026.113392",
          coAuthors: [
            {
              name: "Joynal Abadin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Aminul Islam",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-166",
          title: "A novel 6T5M NVSRAM design with self-inhibiting resistive switching for enhancing stability and reducing power consumption for AI workloads",
          year: 2026,
          citations: 0,
          venue: "Heliyon",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:rbGdIwl2e6cC",
          coAuthors: [
            {
              name: "MRI Rashed",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MR Robin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "SI Ali",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-168",
          title: "SkyGuard-MAE: A Label-Efficient Framework for Real-Time Drone Detection in Restricted Areas Using Self-Supervised Learning",
          year: 2026,
          citations: 0,
          venue: "2026 13th International Conference on Future Internet of Things and Cloud \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/ficloud70576.2026.00043",
          coAuthors: [
            {
              name: "Md. Samir Hossain",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Anika Tahseen",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fahimur Rahman",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Raiyan Gani",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Rifat Ahmmad Rashid",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Shahadat Hossain",
              universityId: "university-of-chittagong",
              universityName: "University of Chittagong",
              city: "Chittagong",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 22.3384,
              lng: 91.83168,
              isHomeInstitution: false
            },
            {
              name: "Raihan Ul Islam",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Karl Andersson",
              universityId: "lule-university-of-technology",
              universityName: "Lule\xE5 University of Technology",
              city: "Lule\xE5",
              country: "Sweden",
              countryCode: "SE",
              continent: "Europe",
              lat: 65.58415,
              lng: 22.15465,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/ficloud70576.2026.00043"
        },
        {
          id: "gs-169",
          title: "Integrated Modeling of Degradation, Recovery, and Environmental Effects on Long-Term Performance of Photovoltaic Modules",
          year: 2026,
          citations: 0,
          venue: "2026 International Conference on Power, Electronics, Communications \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peccii70991.2026.11662045",
          coAuthors: [
            {
              name: "Abul Kashem",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Mohi Uddin Mohin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Abdullah Al Oafi Himon",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Istiac Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peccii70991.2026.11662045"
        },
        {
          id: "gs-170",
          title: "An Adaptive Sensor Fusion Framework for Resilient Intravenous Infusion Monitoring in Low-Resource Settings",
          year: 2026,
          citations: 0,
          venue: "2026 International Conference on Power, Electronics, Communications \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peccii70991.2026.11662075",
          coAuthors: [
            {
              name: "Md Saqlain Mustak Saki",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Shoab Khan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Hujaifa Ahmed Tanvir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Rifat Ahmmad Rashid",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peccii70991.2026.11662075"
        },
        {
          id: "gs-171",
          title: "Techno-Economic and Environmental Analysis and Optimization of Biogas-Solar Hybrid Energy System for Cox\u2019s Bazar Tourism",
          year: 2026,
          citations: 0,
          venue: "2026 International Conference on Power, Electronics, Communications \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/peccii70991.2026.11661951",
          coAuthors: [
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Faysal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Jahidul Hasan Rony",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M. M. Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "bangladesh-university-of-business-and-technology",
              universityName: "Bangladesh University of Business and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Rifat Ahmmad Rashid",
              universityId: "university-of-wollongong",
              universityName: "University of Wollongong",
              city: "Wollongong",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -34.42399978637695,
              lng: 150.89344787597656,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/peccii70991.2026.11661951"
        },
        {
          id: "gs-172",
          title: "Differential Performance Analysis of Schmitt-Trigger-Based SRAM Arrays for Low-Power Applications",
          year: 2026,
          citations: 0,
          venue: "2026 IEEE 2nd International Conference on Quantum Photonics, Artificial \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/qpain69676.2026.11546212",
          coAuthors: [
            {
              name: "Sabiha Amin Tonny",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shihab Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Rashedul Islam Rashed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Chayan Mondal",
              universityId: "gopalganj-science-and-technology-university",
              universityName: "Gopalganj Science and Technology University",
              city: "Gop\u0101lganj",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.22348,
              lng: 90.06041,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/qpain69676.2026.11546212"
        },
        {
          id: "gs-173",
          title: "Optimizing Lightweight DNNs for Accurate, Low-Energy Object Detection in Remote Sensing",
          year: 2026,
          citations: 0,
          venue: "2026 IEEE 2nd International Conference on Quantum Photonics, Artificial \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/qpain69676.2026.11545589",
          coAuthors: [
            {
              name: "Aminul Islam Nayan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abu Yusuf Nayeem",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdus Salam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Roman Nihal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/qpain69676.2026.11545589"
        },
        {
          id: "gs-174",
          title: "Optoelectronic Analysis of Lead Free FASnI 3 Single Junction Solar Cell Incorporating HTL",
          year: 2026,
          citations: 0,
          venue: "2026 IEEE 2nd International Conference on Quantum Photonics, Artificial \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/qpain69676.2026.11546330",
          coAuthors: [
            {
              name: "Md Faiaad Rahman",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Jabed Hasan",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashaduzzaman Niloy",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/qpain69676.2026.11546330"
        },
        {
          id: "gs-175",
          title: "Self-Supervised Learning for Label-Efficient Wheat Head Detection under Dense and Occluded Field Conditions",
          year: 2026,
          citations: 0,
          venue: "2026 IEEE 2nd International Conference on Quantum Photonics, Artificial \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/qpain69676.2026.11546289",
          coAuthors: [
            {
              name: "Mohammad Rifat Ahmmad Rashid",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abul Kalam Al Azad",
              universityId: "north-south-university",
              universityName: "North South University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashaduzzaman Niloy",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Roman Nihal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Raiyan Gani",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Fathhur Rahaman Sams",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Raihan Ul Islam",
              universityId: "east-west-university",
              universityName: "East West University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/qpain69676.2026.11546289"
        },
        {
          id: "gs-176",
          title: "A Bio-Inspired Method for Investigating and Boosting the Performance of Deep Neural Networks",
          year: 2026,
          citations: 0,
          venue: "Results in Engineering, 109021",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1016/j.rineng.2026.109021",
          coAuthors: [
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1016/j.rineng.2026.109021"
        },
        {
          id: "gs-177",
          title: "Influence of Pt, W, and Ru Electrodes on Switching Dynamics of -Based RRAM",
          year: 2025,
          citations: 0,
          venue: "2025 28th International Conference on Computer and Information Technology \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccit68739.2025.11491377",
          coAuthors: [
            {
              name: "Md. Aname Alahi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Rakib Mia",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "S M Asif Hossain",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "AKM Shahabuddin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccit68739.2025.11491377"
        },
        {
          id: "gs-178",
          title: "Low-Power and Robust SRAM Design: Comparative Evaluation of 6T, ST-9T, and SB-9T Architectures",
          year: 2025,
          citations: 0,
          venue: "2025 28th International Conference on Computer and Information Technology \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccit68739.2025.11490529",
          coAuthors: [
            {
              name: "Md Faiyarul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Rakibul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Tahmina Akter",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shihab Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccit68739.2025.11490529"
        },
        {
          id: "gs-179",
          title: "Performance Degradation of Monocrystalline PV Modules Under Progressive Uniform Shading Conditions: An Experimental Study",
          year: 2025,
          citations: 0,
          venue: "2025 28th International Conference on Computer and Information Technology \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccit68739.2025.11491079",
          coAuthors: [
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahariar Ahmed Himo",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Mohi Uddin Mohin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mst. Umme Habiba",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "bangladesh-university-of-business-and-technology",
              universityName: "Bangladesh University of Business and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccit68739.2025.11491079"
        },
        {
          id: "gs-180",
          title: "Harvesting Energy Using Coastal Padma: A Techno-Economic Analysis of Solar-Wind Hybrid Power Generation on Bangladesh\u2019s Largest Infrastructure Bridge",
          year: 2025,
          citations: 0,
          venue: "2025 IEEE 7th International Conference on Sustainable Technologies For \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti69347.2025.11367526",
          coAuthors: [
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Molla Shahadat Hossain Lipu",
              universityId: "university-of-wollongong",
              universityName: "University of Wollongong",
              city: "Wollongong",
              country: "Australia",
              countryCode: "AU",
              continent: "Oceania",
              lat: -34.42399978637695,
              lng: 150.89344787597656,
              isHomeInstitution: false
            },
            {
              name: "Md Faysal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashaduzzaman Niloy",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "bangladesh-university-of-business-and-technology",
              universityName: "Bangladesh University of Business and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Zakir Hossain",
              universityId: "presidency-university",
              universityName: "Presidency University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.796411514282227,
              lng: 90.41734313964844,
              isHomeInstitution: false
            },
            {
              name: "Md. Shariful Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti69347.2025.11367526"
        },
        {
          id: "gs-181",
          title: "Comparative Analysis of Siamese Networks and ResNet Embeddings for One Shot Learning",
          year: 2025,
          citations: 0,
          venue: "2025 IEEE 7th International Conference on Sustainable Technologies For \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti69347.2025.11367602",
          coAuthors: [
            {
              name: "Md. Ashaduzzaman Niloy",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Carlos Tierno Jimenez",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Md. Istiac Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M. M. Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti69347.2025.11367602"
        },
        {
          id: "gs-182",
          title: "Central Control Automation System of Grid Substation Using High-Speed Communication",
          year: 2025,
          citations: 0,
          venue: "2025 IEEE International Conference on Signal Processing, Information \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/spicscon69221.2025.11504419",
          coAuthors: [
            {
              name: "Md. Manir Hossain",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Abdulla Al Mamun",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Partho Singh",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Md Faysal Miah",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashaduzzaman Niloy",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/spicscon69221.2025.11504419"
        },
        {
          id: "gs-183",
          title: "Optimization and Economic Viability of a PV-Hydrogen Fuel Cell Hybrid System for Remote Areas: A Case Study",
          year: 2025,
          citations: 0,
          venue: "2025 IEEE 5th International Conference on Sustainable Energy and Future \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sefet65155.2025.11255093",
          coAuthors: [
            {
              name: "Md. Ashraful Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M M Naushad Ali",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Mohi Uddin Mohin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sabbir Alam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahariar Ahmed Himo",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Mokarram Hossain",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Anorgul I. Ashirova",
              universityId: "mamun-university",
              universityName: "Mamun University",
              city: "Khiva",
              country: "Uzbekistan",
              countryCode: "UZ",
              continent: "Asia",
              lat: 41.38555,
              lng: 60.36408,
              isHomeInstitution: false
            },
            {
              name: "Yuldoshev Jushkinbek Erkaboy Ugli",
              universityId: "urganch-innovation-university",
              universityName: "Urganch Innovation University",
              city: "Urgench",
              country: "Uzbekistan",
              countryCode: "UZ",
              continent: "Asia",
              lat: 41.55339050292969,
              lng: 60.62057113647461,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sefet65155.2025.11255093"
        },
        {
          id: "gs-184",
          title: "High-Performance Bootstrapped Sample & Hold Circuit for ADCs: Achieving Low Power and Enhanced SNR/SNDR in 45nm CMOS Technology",
          year: 2025,
          citations: 0,
          venue: "Journal of Electronic Voltage and Application",
          quartile: "Q4",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.30880/jeva.2025.06.01.006",
          coAuthors: [
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Siful Islam Pranto",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Shakib Ibne Ashrafi",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Sadi Mohammad Moin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohi Uddin Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Murad Kabir Nipun",
              universityId: "international-university-of-business-agriculture-and-technology",
              universityName: "International University of Business Agriculture and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.30880/jeva.2025.06.01.006"
        },
        {
          id: "gs-185",
          title: "Hybrid AI Classification Techniques for Multi-Class Leukemia Sub-Types Classification with Bone Marrow Cells",
          year: 2024,
          citations: 0,
          venue: "2024 6th International Conference on Sustainable Technologies for Industry 5 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti64222.2024.10951147",
          coAuthors: [
            {
              name: "Md Delwar Hossain",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Minhaz Ul Karim Asif",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Razaul Haque Rasham",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti64222.2024.10951147"
        },
        {
          id: "gs-187",
          title: "A New Self-Balancing Five-Level Switch Capacitor Inverter for Standalone Applications",
          year: 2023,
          citations: 0,
          venue: "2023 10th IEEE International Conference on Power Systems (ICPS)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icps60393.2023.10428717",
          coAuthors: [
            {
              name: "Md. Naiem-Ur-Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Fayzur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Kamran Ahmed",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Tariqul Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icps60393.2023.10428717"
        },
        {
          id: "gs-188",
          title: "Performance Improvement of Single-Phase Inverter Topology by Using Modified Triangular Carrier Signal",
          year: 2023,
          citations: 0,
          venue: "2023 10th IEEE International Conference on Power Systems (ICPS)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icps60393.2023.10428692",
          coAuthors: [
            {
              name: "Shihab Hosen",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Rukhshana Parvin",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Riday Hossen",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Avoy Roy",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ordatun Jannat",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahela Akter",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icps60393.2023.10428692"
        },
        {
          id: "gs-189",
          title: "Person Adapted Emotion Recognition using Deep Learning",
          year: 2023,
          citations: 0,
          venue: "2023 26th International Conference on Computer and Information Technology \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccit60459.2023.10441435",
          coAuthors: [
            {
              name: "Md Hafiz Sikder",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Ashiqur Rahman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccit60459.2023.10441435"
        },
        {
          id: "gs-190",
          title: "Smart Seed Selection Using Inverse Ridge Response for Region Growing Segmentation",
          year: 2023,
          citations: 0,
          venue: "2023 5th International Conference on Sustainable Technologies for Industry 5 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti59863.2023.10465072",
          coAuthors: [
            {
              name: "Muhammad Abul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti59863.2023.10465072"
        },
        {
          id: "gs-191",
          title: "Active Supervision: Human in the Loop",
          year: 2023,
          citations: 0,
          venue: "Iberoamerican Congress on Pattern Recognition",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1007/978-3-031-49018-7_38",
          coAuthors: [
            {
              name: "Ricardo Cruz",
              universityId: "universidade-do-porto",
              universityName: "Universidade do Porto",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Ricardo Cruz",
              universityId: "inesc-tec",
              universityName: "INESC TEC",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Jaime S. Cardoso",
              universityId: "universidade-do-porto",
              universityName: "Universidade do Porto",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            },
            {
              name: "Jaime S. Cardoso",
              universityId: "inesc-tec",
              universityName: "INESC TEC",
              city: "Porto",
              country: "Portugal",
              countryCode: "PT",
              continent: "Europe",
              lat: 41.1485,
              lng: -8.61097,
              isHomeInstitution: false
            }
          ],
          doi: "10.1007/978-3-031-49018-7_38"
        },
        {
          id: "gs-197",
          title: "An eight point model for addressing challenges of online education at tertiary level",
          year: 2022,
          citations: 0,
          venue: "4th International Conference on Sustainable Technology for Industry 4.0: STI \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=100&pagesize=100&citation_for_view=be8uiCkAAAAJ:M0leSnx2MbUC",
          coAuthors: [
            {
              name: "A Rahman",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MGS Fakir",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MA Razzaque",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "HAZ Rony",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-198",
          title: "Exergy-based performance evaluation of the thermal power plants in Bangladesh for in-depth understanding and future recommendations",
          year: 2022,
          citations: 0,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103243",
          coAuthors: [
            {
              name: "Sameya Afrin July",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Mahmudul Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ratil Hasnat Ashique",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Al Mansur",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103243"
        },
        {
          id: "gs-199",
          title: "Revealing Climate Change from Moon Images with Dimensionality Reduction and Machine Learning",
          year: 2022,
          citations: 0,
          venue: "2022 4th International Conference on Sustainable Technologies for Industry 4 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/sti56238.2022.10103299",
          coAuthors: [
            {
              name: "Peter A. Thejll",
              universityId: "danish-meteorological-institute",
              universityName: "Danish Meteorological Institute",
              city: "Copenhagen",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.67594,
              lng: 12.56553,
              isHomeInstitution: false
            },
            {
              name: "Monica Jane Emerson",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.77044,
              lng: 12.50378,
              isHomeInstitution: false
            },
            {
              name: "Dewan Mohammad Saaduzzaman",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Hasan Maruf",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/sti56238.2022.10103299"
        },
        {
          id: "gs-200",
          title: "Impact Study of Online Assessment Methods Facilitating Blended Learning towards Inclusion and Equity",
          year: 2022,
          citations: 0,
          venue: "6th International Conference on Equity and Inclusion in Education (ACIE 2022 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=200&pagesize=100&citation_for_view=be8uiCkAAAAJ:QsaTk4IG4EwC",
          coAuthors: [
            {
              name: "MMMS Arifa Rahman",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-201",
          title: "Impact study of data-driven automated system for maintaining equality in Outcome Based Education",
          year: 2022,
          citations: 0,
          venue: "6th International Conference on Equity and Inclusion in Education",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=200&pagesize=100&citation_for_view=be8uiCkAAAAJ:PQEM9vzQD9gC",
          coAuthors: [
            {
              name: "MMM Syeed",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Abul Hasan",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "F Uddin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "A Rahman",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-207",
          title: "Statistical Model Based Breast Tumor Classification in Contourlet Transform Domain",
          year: 2021,
          citations: 0,
          venue: "GUB Journal of Science and Engineering",
          quartile: "Q3",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.3329/gubjse.v7i0.54014",
          coAuthors: [
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Sayed Tanveer",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Mohammed Imamul Hassan Bhuiyan",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ],
          doi: "10.3329/gubjse.v7i0.54014"
        },
        {
          id: "gs-209",
          title: "Determination of Initial Projectile Velocity in the Presence of Static Fields Using Deep Actor Critic Method",
          year: 2020,
          citations: 0,
          venue: "2020 11th International Conference on Electrical and Computer Engineering \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/icece51571.2020.9393103",
          coAuthors: [
            {
              name: "Md. Sayed Tanveer",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Shahriar Mahmud Kabir",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/icece51571.2020.9393103"
        },
        {
          id: "gs-218",
          title: "A comparative analysis between the Step Index fiber and Polarization Maintaining fiber on the basis of their modal solutions",
          year: 2010,
          citations: 0,
          venue: "2010 International Conference on Electronics and Information Engineering 2 \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iceie.2010.5559710",
          coAuthors: [
            {
              name: "Anupom Acharya",
              universityId: "eastern-university",
              universityName: "Eastern University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.742799758911133,
              lng: 90.38059997558594,
              isHomeInstitution: false
            },
            {
              name: "Mir Nahidul Ambia",
              universityId: "eastern-university",
              universityName: "Eastern University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.742799758911133,
              lng: 90.38059997558594,
              isHomeInstitution: false
            },
            {
              name: "Mohammad Abdur Rob",
              universityId: "eastern-university",
              universityName: "Eastern University",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.742799758911133,
              lng: 90.38059997558594,
              isHomeInstitution: false
            },
            {
              name: "Abu S. M. Mohsin",
              universityId: "stamford-university-bangladesh",
              universityName: "Stamford University Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iceie.2010.5559710"
        },
        {
          id: "gs-219",
          title: "Spectral and Statistical Analysis of Human Sleep EEG Signals",
          year: 2010,
          citations: 0,
          venue: "Journal of Engineering and Technology",
          quartile: "Q4",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=be8uiCkAAAAJ&cstart=200&pagesize=100&citation_for_view=be8uiCkAAAAJ:1lhNe0rCu4AC",
          coAuthors: [
            {
              name: "MS Amin",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MR Azim",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            },
            {
              name: "MA Hoque",
              universityId: "unlisted",
              universityName: "Independent / Unlisted",
              city: "Unlisted",
              country: "Unlisted",
              countryCode: "UN",
              continent: "Asia",
              lat: 0,
              lng: 0,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "gs-220",
          title: "A new SS7-SIGTRAN protocol interchanger software and hardware to implement an improved distributed database based ATM network using existing IP network",
          year: 2008,
          citations: 0,
          venue: "2008 11th International Conference on Computer and Information Technology \u2026",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccitechn.2008.4803027",
          coAuthors: [
            {
              name: "M. S. Munir",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "K. Ahmed",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "S. M. Nizamuddin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Jahangir Hossain Sarker",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccitechn.2008.4803027"
        },
        {
          id: "gs-221",
          title: "A new SS7-SIGTRAN protocol interchanger software operated with modified USB E1 for nationwide IP backbone-Necessity for BTCL PSTN",
          year: 2008,
          citations: 0,
          venue: "2008 International Conference on Electrical and Computer Engineering",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          url: "https://doi.org/10.1109/iccitechn.2008.4803027",
          coAuthors: [
            {
              name: "M. S. Munir",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "K. Ahmed",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "S. M. Nizamuddin",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Muhammad Jahangir Hossain Sarker",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            }
          ],
          doi: "10.1109/iccitechn.2008.4803027"
        },
        {
          id: "oa-159",
          title: "A new SS7-SIGTRAN protocol interchanger software operated with modified USB E1 for nationwide IP backbone - Necessity for BTCL PSTN",
          year: 2008,
          citations: 0,
          venue: "International Conference on Electrical and Computer Engineering (ICECE)",
          quartile: "Unranked",
          type: "Conference",
          authorshipRole: "Co-Author",
          openAccess: false,
          doi: "10.1109/icece.2008.4769277",
          url: "https://doi.org/10.1109/icece.2008.4769277",
          coAuthors: [
            {
              name: "M. S. Munir",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "K. Ahmed",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Tahmid Latif",
              universityId: "islamic-university-of-technology",
              universityName: "Islamic University of Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.947555541992188,
              lng: 90.37980651855469,
              isHomeInstitution: false
            },
            {
              name: "Md. Saifur Rahman",
              universityId: "bangladesh-university-of-engineering-and-technology",
              universityName: "Bangladesh University of Engineering and Technology",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7104,
              lng: 90.40744,
              isHomeInstitution: false
            }
          ]
        },
        {
          id: "oa-160",
          title: "A 48-class handwritten dataset for the endangered chakma language",
          year: 2026,
          citations: 0,
          venue: "Data in Brief",
          quartile: "Q2",
          type: "Journal",
          authorshipRole: "Co-Author",
          openAccess: true,
          doi: "10.1016/j.dib.2026.112796",
          url: "https://doi.org/10.1016/j.dib.2026.112796",
          coAuthors: [
            {
              name: "Jannatul Ferdeous",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md. Abdul Kayum",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Ahmed Islam",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "Md Roman Nihal",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            },
            {
              name: "M Tasdik Hasan",
              universityId: "green-university-of-bangladesh",
              universityName: "Green University of Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.710399627685547,
              lng: 90.40744018554688,
              isHomeInstitution: false
            }
          ]
        }
      ]
    },
    isFallback: false
  },
  "3nI1dHsAAAAJ": {
    profile: {
      id: "scholar-3nI1dHsAAAAJ",
      scholarUserId: "3nI1dHsAAAAJ",
      scholarUrl: "https://scholar.google.com/citations?user=3nI1dHsAAAAJ&hl=en",
      name: "Joynal Abadin",
      affiliation: "Undergraduate Student, Dept. of EEE, Green University of Bangladesh",
      homeUniversityId: "green-university-of-bangladesh",
      homeUniversity: "Green University of Bangladesh",
      homeCity: "Dhaka",
      homeCountry: "Bangladesh",
      homeLat: 23.8285,
      homeLng: 90.5663,
      verifiedDomain: "student.green.ac.bd",
      fields: [
        "Machine Learning",
        "Electric Vehicles",
        "Renewable Energy"
      ],
      officialMetrics: {
        totalCitations: 0,
        hIndex: 0,
        i10Index: 0
      },
      publications: [
        {
          id: "gs-0",
          title: "A 25-year Landsat-derived environmental observation dataset for Narayanganj, Bangladesh, 2001\u20132025",
          year: 2026,
          citations: 0,
          venue: "Data in Brief",
          quartile: "Q1",
          type: "Journal",
          authorshipRole: "First Author",
          openAccess: true,
          doi: "10.1016/j.dib.2026.113392",
          url: "https://doi.org/10.1016/j.dib.2026.113392",
          coAuthors: [
            {
              name: "ASM Shihavuddin",
              universityId: "university-of-liberal-arts-bangladesh",
              universityName: "University of Liberal Arts Bangladesh",
              city: "Dhaka",
              country: "Bangladesh",
              countryCode: "BD",
              continent: "Asia",
              lat: 23.7548,
              lng: 90.3585,
              isHomeInstitution: false
            },
            {
              name: "Aminul Islam",
              universityId: "technical-university-of-denmark",
              universityName: "Technical University of Denmark",
              city: "Kongens Lyngby",
              country: "Denmark",
              countryCode: "DK",
              continent: "Europe",
              lat: 55.7858,
              lng: 12.5218,
              isHomeInstitution: false
            }
          ]
        }
      ]
    },
    isFallback: false
  }
};

// server.ts
dotenv.config();
var ISO_COUNTRY_INFO = {
  BD: { country: "Bangladesh", continent: "Asia", lat: 23.8103, lng: 90.4125 },
  US: { country: "United States", continent: "North America", lat: 38.8951, lng: -77.0364 },
  CA: { country: "Canada", continent: "North America", lat: 45.4215, lng: -75.6972 },
  GB: { country: "United Kingdom", continent: "Europe", lat: 51.5074, lng: -0.1278 },
  DK: { country: "Denmark", continent: "Europe", lat: 55.6761, lng: 12.5683 },
  FR: { country: "France", continent: "Europe", lat: 48.8566, lng: 2.3522 },
  DE: { country: "Germany", continent: "Europe", lat: 52.52, lng: 13.405 },
  ES: { country: "Spain", continent: "Europe", lat: 40.4168, lng: -3.7038 },
  PT: { country: "Portugal", continent: "Europe", lat: 38.7223, lng: -9.1393 },
  IT: { country: "Italy", continent: "Europe", lat: 41.9028, lng: 12.4964 },
  NL: { country: "Netherlands", continent: "Europe", lat: 52.3676, lng: 4.9041 },
  CH: { country: "Switzerland", continent: "Europe", lat: 47.3769, lng: 8.5417 },
  SE: { country: "Sweden", continent: "Europe", lat: 59.3293, lng: 18.0686 },
  NO: { country: "Norway", continent: "Europe", lat: 59.9139, lng: 10.7522 },
  FI: { country: "Finland", continent: "Europe", lat: 60.1699, lng: 24.9384 },
  BE: { country: "Belgium", continent: "Europe", lat: 50.8503, lng: 4.3517 },
  AT: { country: "Austria", continent: "Europe", lat: 48.2082, lng: 16.3738 },
  IE: { country: "Ireland", continent: "Europe", lat: 53.3498, lng: -6.2603 },
  PL: { country: "Poland", continent: "Europe", lat: 52.2297, lng: 21.0122 },
  CZ: { country: "Czechia", continent: "Europe", lat: 50.0755, lng: 14.4378 },
  GR: { country: "Greece", continent: "Europe", lat: 37.9838, lng: 23.7275 },
  TR: { country: "Turkey", continent: "Asia", lat: 39.9334, lng: 32.8597 },
  MY: { country: "Malaysia", continent: "Asia", lat: 3.139, lng: 101.6869 },
  SG: { country: "Singapore", continent: "Asia", lat: 1.3521, lng: 103.8198 },
  CN: { country: "China", continent: "Asia", lat: 39.9042, lng: 116.4074 },
  HK: { country: "China (Hong Kong)", continent: "Asia", lat: 22.3193, lng: 114.1694 },
  JP: { country: "Japan", continent: "Asia", lat: 35.6762, lng: 139.6503 },
  KR: { country: "South Korea", continent: "Asia", lat: 37.5665, lng: 126.978 },
  IN: { country: "India", continent: "Asia", lat: 28.6139, lng: 77.209 },
  PK: { country: "Pakistan", continent: "Asia", lat: 33.6844, lng: 73.0479 },
  SA: { country: "Saudi Arabia", continent: "Asia", lat: 24.7136, lng: 46.6753 },
  AE: { country: "United Arab Emirates", continent: "Asia", lat: 24.4539, lng: 54.3773 },
  QA: { country: "Qatar", continent: "Asia", lat: 25.2854, lng: 51.531 },
  TH: { country: "Thailand", continent: "Asia", lat: 13.7563, lng: 100.5018 },
  VN: { country: "Vietnam", continent: "Asia", lat: 21.0278, lng: 105.8342 },
  ID: { country: "Indonesia", continent: "Asia", lat: -6.2088, lng: 106.8456 },
  AU: { country: "Australia", continent: "Oceania", lat: -33.8688, lng: 151.2093 },
  NZ: { country: "New Zealand", continent: "Oceania", lat: -36.8485, lng: 174.7633 },
  EG: { country: "Egypt", continent: "Africa", lat: 30.0444, lng: 31.2357 },
  ZA: { country: "South Africa", continent: "Africa", lat: -33.9249, lng: 18.4241 },
  NG: { country: "Nigeria", continent: "Africa", lat: 9.0765, lng: 7.3986 },
  BR: { country: "Brazil", continent: "South America", lat: -23.5505, lng: -46.6333 },
  MX: { country: "Mexico", continent: "North America", lat: 19.4326, lng: -99.1332 },
  AR: { country: "Argentina", continent: "South America", lat: -34.6037, lng: -58.3816 },
  CL: { country: "Chile", continent: "South America", lat: -33.4489, lng: -70.6693 },
  CO: { country: "Colombia", continent: "South America", lat: 4.711, lng: -74.0721 }
};
function slugifyInstitution(name) {
  return name.toLowerCase().replace(/–|—/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "institution";
}
function normalizeUniversityDisplayName(name) {
  return name.replace(/East–West University/gi, "East West University").trim();
}
function cleanVenueName(rawVenue) {
  if (!rawVenue) return "Academic Venue";
  let v = rawVenue.replace(/\s+/g, " ").replace(/,\s*(19|20)\d{2}\s*$/, "").trim();
  v = v.replace(/,?\s*\bvol\.?\s*\d+.*$/i, "").replace(/,?\s*\bno\.?\s*\d+.*$/i, "").replace(/,?\s*\bpp\.?\s*\d+.*$/i, "").replace(/\s+\d+\s*\([^)]+\).*$/i, "").replace(/\s+\d+\s*,\s*[\d–eE.-]+.*$/i, "").replace(/,\s*\d+-\d+.*$/i, "").replace(/,\s*[A-Za-z]?\d{4,8}\s*$/i, "").replace(/\s+\(\d{4}\)\s*$/i, "").replace(/\s+\d{1,4}\s*$/i, "").replace(/^[,\s-]+|[,\s-]+$/g, "").trim();
  if (/^nature communications/i.test(v) || /^nat\.\s*commun/i.test(v)) return "Nature Communications";
  if (/^the embo journal$/i.test(v)) return "The EMBO Journal";
  if (/^ieee access$/i.test(v)) return "IEEE Access";
  if (/^plos one$/i.test(v)) return "PLOS ONE";
  if (/^scientific reports$/i.test(v)) return "Scientific Reports";
  if (/^front(\.|iers in)\s*plant\s*sci/i.test(v)) return "Frontiers in Plant Science";
  if (/^(sustainable\s+)?energy\s+technol(\.|ogies)\s*(and\s+)?assess/i.test(v))
    return "Sustainable Energy Technologies and Assessments";
  if (/^energy conversion and management:?\s*x$/i.test(v))
    return "Energy Conversion and Management: X";
  if (/^gub journal of science and engineering/i.test(v))
    return "GUB Journal of Science and Engineering";
  if (/^journal of engineering and technology\s*(\(jet\))?$/i.test(v))
    return "Journal of Engineering and Technology";
  if (/^int\.\s*j\.\s*comput\.\s*sci\.\s*netw/i.test(v) || /^international journal of computer science and network security/i.test(v)) {
    return "International Journal of Computer Science and Network Security";
  }
  return v || "Academic Venue";
}
function shouldExcludeNonPaperRecord(params) {
  const title = (params.title || "").trim();
  const rawVenue = (params.venue || "").trim();
  const tLower = title.toLowerCase();
  const vLower = rawVenue.toLowerCase();
  const wType = (params.workType || "").toLowerCase();
  const sType = (params.sourceType || "").toLowerCase();
  if (!title || title.length < 10) return true;
  if (/,\s*0(\s|$)/.test(title) || /,\s*0(\s|$)/.test(rawVenue)) return true;
  if (tLower.includes("the author (s)") || tLower.includes("the author(s)") || /^[a-z]{1,3}\d{4,}$/i.test(title) || /^[a-z]{1,3}\d{4,}\b/i.test(tLower) || /^[^\w]*\d+\s+[A-Z]/.test(title) || /\bpp\.\s*\d+/i.test(title) || /\bet\s+al\b/i.test(vLower) || // Venues that are actually author citation headers (e.g., "Surname, F, 2020", "Surname A, Surname B", etc.) without any publication venue keywords
  !/journal|conf|proc|trans|ieee|lett|rev|symp|ann|bull|arch|commun|adv|res|rep|chem|phys|eng|med|sci/i.test(
    vLower
  ) && (/^[a-z]+,\s*[a-z](\.[a-z])?/i.test(vLower) || /^[a-z\s]+,\s*(?:19|20)\d{2}\b/i.test(vLower)) || /^seta-d-\d+/i.test(vLower) || (rawVenue.includes("\u2026") || rawVenue.includes("...")) && !/conference|symposium|workshop|proceedings|journal|ieee|international|lecture|transactions/i.test(
    vLower
  )) {
    return true;
  }
  const excludedTypes = [
    "dataset",
    "posted-content",
    "preprint",
    "dissertation",
    "thesis",
    "peer-review",
    "component",
    "grant",
    "standard",
    "report",
    "paratext",
    "erratum",
    "corrigendum",
    "retraction",
    "letter",
    "editorial"
  ];
  if (excludedTypes.some((et) => wType === et || wType.includes(et))) {
    return true;
  }
  if (sType === "repository") {
    return true;
  }
  const nonPaperVenuePatterns = [
    "mendeley data",
    "mendeley",
    "dataverse",
    "harvard dataverse",
    "dans data station",
    "data archiving and networked services",
    "(dans)",
    "dans ",
    "[google scholar]",
    "stays neutral with regard to jurisdictional claims",
    "universidad de zaragoza",
    "zenodo",
    "figshare",
    "dryad",
    "kaggle",
    "github",
    "gitlab",
    "bitbucket",
    "sourceforge",
    "code ocean",
    "arxiv",
    "biorxiv",
    "medrxiv",
    "techrxiv",
    "chemrxiv",
    "engrxiv",
    "ssrn",
    "research square",
    "preprints",
    "authorea",
    "hal-",
    "open science framework",
    "osf.io",
    "virological",
    "thesis",
    "dissertation",
    "master thesis",
    "phd thesis",
    "bachelor thesis",
    "technical report",
    "working paper",
    "white paper",
    "poster",
    "patent",
    "us patent"
  ];
  if (nonPaperVenuePatterns.some((pat) => vLower.includes(pat))) {
    return true;
  }
  const repositoryPatterns = [
    "zenodo",
    "dataverse",
    "figshare",
    "dryad",
    "mendeley data",
    "kaggle",
    "github.com",
    "code ocean",
    "[data set]",
    "[dataset]",
    "replication data",
    "open data repository"
  ];
  if (repositoryPatterns.some(
    (pat) => tLower.includes(pat) || vLower.includes(pat)
  )) {
    return true;
  }
  if (/\bversion\s+v?\d+/i.test(vLower) || /\bversion\s+v?\d+/i.test(tLower) || /\bv\d+\.\[google/i.test(vLower) || /^data\s+for:/i.test(tLower) || /^supplementary\s+(data|material|information)/i.test(tLower) || /\bcode\s+repository\b/i.test(tLower) || /\b(phd|master'?s|doctoral)\s+(thesis|dissertation)\b/i.test(tLower)) {
    return true;
  }
  if ((!vLower || vLower === "academic venue") && (params.citations || 0) === 0) {
    return true;
  }
  if (params.title.trim().length < 40 && (/,\s*[A-Z]\.?(\s*,\s*|\s+and\s*$|$)/.test(params.title.trim()) || /\bshihavuddin\b/i.test(tLower))) {
    return true;
  }
  return false;
}
var officialInstitutionGeoCache = /* @__PURE__ */ new Map();
async function queryWikidataInstitutionCoords(institutionName, rorId) {
  try {
    const cleanRor = rorId ? rorId.replace("https://ror.org/", "").trim() : "";
    const sparql = cleanRor ? `SELECT ?coord WHERE { ?item wdt:P6782 "${cleanRor}". ?item wdt:P625 ?coord. } LIMIT 1` : `SELECT ?coord WHERE { ?item rdfs:label "${institutionName.replace(
      /"/g,
      ""
    )}"@en. ?item wdt:P625 ?coord. } LIMIT 1`;
    const res = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
        sparql
      )}`,
      {
        headers: {
          "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
        },
        signal: AbortSignal.timeout(2500)
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const wkt = String(data?.results?.bindings?.[0]?.coord?.value || "");
    const m = wkt.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/i);
    if (m) {
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  } catch {
  }
  return null;
}
async function resolveInstitutionFromOfficialSources(rawInstName, rawCountryCode, openAlexId, geoCache) {
  const cleanName = normalizeUniversityDisplayName(rawInstName);
  const cacheKey = `${cleanName.toLowerCase()}::${openAlexId || ""}`;
  if (officialInstitutionGeoCache.has(cacheKey)) {
    return officialInstitutionGeoCache.get(cacheKey);
  }
  if (openAlexId && geoCache?.has(openAlexId)) {
    const rec = geoCache.get(openAlexId);
    const cc2 = (rec.geo?.country_code || rec.country_code || rawCountryCode || "US").toUpperCase();
    const countryInfo = ISO_COUNTRY_INFO[cc2] || {
      country: rec.geo?.country || cc2,
      continent: "Asia",
      lat: 23.8103,
      lng: 90.4125
    };
    let lat = typeof rec.geo?.latitude === "number" ? rec.geo.latitude : countryInfo.lat;
    let lng = typeof rec.geo?.longitude === "number" ? rec.geo.longitude : countryInfo.lng;
    const wdCoords = await queryWikidataInstitutionCoords(
      rec.display_name || cleanName,
      rec.ror
    );
    if (wdCoords) {
      lat = wdCoords.lat;
      lng = wdCoords.lng;
    }
    const resolved = {
      universityId: slugifyInstitution(rec.display_name || cleanName),
      universityName: normalizeUniversityDisplayName(
        rec.display_name || cleanName
      ),
      city: rec.geo?.city || rec.geo?.country || countryInfo.country,
      country: rec.geo?.country || countryInfo.country,
      countryCode: cc2,
      continent: countryInfo.continent,
      lat,
      lng
    };
    officialInstitutionGeoCache.set(cacheKey, resolved);
    officialInstitutionGeoCache.set(
      `${resolved.universityName.toLowerCase()}::`,
      resolved
    );
    return resolved;
  }
  try {
    const [rorRes, oaSearchRes] = await Promise.all([
      fetch(
        `https://api.ror.org/v2/organizations?query=${encodeURIComponent(
          cleanName
        )}`,
        {
          headers: {
            "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
          },
          signal: AbortSignal.timeout(3e3)
        }
      ).catch(() => null),
      fetch(
        `https://api.openalex.org/institutions?search=${encodeURIComponent(
          cleanName
        )}&per-page=3&select=id,display_name,ror,country_code,geo`,
        {
          headers: {
            "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
          },
          signal: AbortSignal.timeout(3e3)
        }
      ).catch(() => null)
    ]);
    if (oaSearchRes?.ok) {
      const oaData = await oaSearchRes.json();
      const topInst = oaData?.results?.[0];
      if (topInst) {
        const cc2 = String(
          topInst.geo?.country_code || topInst.country_code || rawCountryCode || "US"
        ).toUpperCase();
        const countryInfo = ISO_COUNTRY_INFO[cc2] || ISO_COUNTRY_INFO.US;
        let lat = typeof topInst.geo?.latitude === "number" ? topInst.geo.latitude : countryInfo.lat;
        let lng = typeof topInst.geo?.longitude === "number" ? topInst.geo.longitude : countryInfo.lng;
        const wdCoords = await queryWikidataInstitutionCoords(
          topInst.display_name || cleanName,
          topInst.ror
        );
        if (wdCoords) {
          lat = wdCoords.lat;
          lng = wdCoords.lng;
        }
        const resolved = {
          universityId: slugifyInstitution(topInst.display_name || cleanName),
          universityName: normalizeUniversityDisplayName(
            topInst.display_name || cleanName
          ),
          city: topInst.geo?.city || topInst.geo?.country || countryInfo.country,
          country: topInst.geo?.country || countryInfo.country,
          countryCode: cc2,
          continent: countryInfo.continent,
          lat,
          lng
        };
        officialInstitutionGeoCache.set(cacheKey, resolved);
        return resolved;
      }
    }
    if (rorRes?.ok) {
      const rorData = await rorRes.json();
      const item = rorData?.items?.[0];
      const loc = item?.locations?.[0]?.geonames_details;
      if (item && loc) {
        const cc2 = String(
          loc.country_code || rawCountryCode || "US"
        ).toUpperCase();
        const countryInfo = ISO_COUNTRY_INFO[cc2] || ISO_COUNTRY_INFO.US;
        const rorDisplay = item.names?.find((n) => n.types?.includes("ror_display"))?.value || cleanName;
        let lat = typeof loc.lat === "number" ? loc.lat : countryInfo.lat;
        let lng = typeof loc.lng === "number" ? loc.lng : countryInfo.lng;
        const wdCoords = await queryWikidataInstitutionCoords(
          rorDisplay,
          item.id
        );
        if (wdCoords) {
          lat = wdCoords.lat;
          lng = wdCoords.lng;
        }
        const resolved = {
          universityId: slugifyInstitution(rorDisplay),
          universityName: normalizeUniversityDisplayName(rorDisplay),
          city: loc.name || loc.country_name || countryInfo.country,
          country: loc.country_name || countryInfo.country,
          countryCode: cc2,
          continent: countryInfo.continent,
          lat,
          lng
        };
        officialInstitutionGeoCache.set(cacheKey, resolved);
        return resolved;
      }
    }
  } catch {
  }
  const wdFallback = await queryWikidataInstitutionCoords(cleanName);
  const cc = (rawCountryCode || "BD").toUpperCase();
  const base = ISO_COUNTRY_INFO[cc] || ISO_COUNTRY_INFO.BD;
  const fallbackResolved = {
    universityId: slugifyInstitution(cleanName),
    universityName: cleanName,
    city: base.country,
    country: base.country,
    countryCode: cc,
    continent: base.continent,
    lat: wdFallback?.lat ?? base.lat,
    lng: wdFallback?.lng ?? base.lng
  };
  officialInstitutionGeoCache.set(cacheKey, fallbackResolved);
  return fallbackResolved;
}
function decodeHtmlEntities(str) {
  return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code))).trim();
}
async function fetchScholarPageHtml(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };
  try {
    const resp = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(5e3)
    });
    if (resp.ok) {
      const html = await resp.text();
      if (html.includes("gsc_prf_in") || html.includes("gsc_a_tr")) {
        return html;
      }
    }
  } catch {
  }
  const proxyEndpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(url)}`
  ];
  for (const pUrl of proxyEndpoints) {
    try {
      const pResp = await fetch(pUrl, {
        signal: AbortSignal.timeout(5500)
      });
      if (pResp.ok) {
        const pHtml = await pResp.text();
        if (pHtml.includes("gsc_prf_in") || pHtml.includes("gsc_a_tr")) {
          return pHtml;
        }
      }
    } catch {
    }
  }
  return null;
}
async function scrapeGoogleScholarFullProfile(userId) {
  try {
    const makePageUrl = (cstart) => `https://scholar.google.com/citations?user=${encodeURIComponent(
      userId
    )}&hl=en&cstart=${cstart}&pagesize=100`;
    const firstPageHtml = await fetchScholarPageHtml(makePageUrl(0));
    if (!firstPageHtml) return null;
    const pagesHtml = [firstPageHtml];
    const firstRows = [...firstPageHtml.matchAll(/<tr class="gsc_a_tr">/g)];
    if (firstRows.length >= 100) {
      const morePages = await Promise.all([
        fetchScholarPageHtml(makePageUrl(100)),
        fetchScholarPageHtml(makePageUrl(200))
      ]);
      for (const pHtml of morePages) {
        if (pHtml) pagesHtml.push(pHtml);
      }
    }
    const firstPage = pagesHtml[0];
    const nameMatch = firstPage.match(/id="gsc_prf_in"[^>]*>([^<]+)</i);
    const titleMatch = firstPage.match(
      /<title>([^<-]+)\s*[-–]\s*Google Scholar/i
    );
    const name = decodeHtmlEntities(nameMatch?.[1] || titleMatch?.[1] || "");
    if (!name) return null;
    const affilMatch = firstPage.match(
      /class="gsc_prf_il"[^>]*>([\s\S]*?)<\/div>/i
    );
    const affiliation = decodeHtmlEntities(
      (affilMatch?.[1] || "Academic Researcher").replace(/<[^>]+>/g, "")
    );
    const domainMatch = firstPage.match(
      /Verified email at\s+([a-zA-Z0-9.-]+)/i
    );
    const verifiedDomain = domainMatch?.[1] || "scholar.google.com";
    const fieldMatches = [
      ...firstPage.matchAll(/class="gsc_prf_inta[^"]*"[^>]*>([^<]+)<\/a>/gi)
    ];
    const fields = fieldMatches.map((m) => decodeHtmlEntities(m[1])).filter(Boolean);
    const stdCells = [
      ...firstPage.matchAll(/class="gsc_rsb_std"[^>]*>(\d+)<\/td>/gi)
    ].map((m) => Number(m[1]));
    const officialMetrics = {
      totalCitations: stdCells[0] || 0,
      hIndex: stdCells[2] || 0,
      i10Index: stdCells[4] || 0
    };
    const sidebarCoAuthors = [];
    const coDescBlocks = [
      ...firstPage.matchAll(
        /class="gsc_rsb_a_desc"[^>]*>([\s\S]*?)<\/span>\s*<\/div>/gi
      )
    ];
    for (const block of coDescBlocks) {
      const inner = block[1];
      const coNameMatch = inner.match(/<a[^>]*>([^<]+)<\/a>/i);
      const extMatch = inner.match(/class="gsc_rsb_a_ext"[^>]*>([^<]+)<\/span>/i);
      if (coNameMatch?.[1]) {
        const cleanCoName = decodeHtmlEntities(coNameMatch[1]).replace(/,\s*(PhD|SMIEEE|MIEEE|FIEEE|Dr\.|Prof\.)/gi, "").trim();
        const coAff = decodeHtmlEntities(extMatch?.[1] || "");
        sidebarCoAuthors.push({ name: cleanCoName, affiliation: coAff });
      }
    }
    const publications = [];
    const seenNormTitles = /* @__PURE__ */ new Set();
    for (const pageHtml of pagesHtml) {
      const rowMatches = [
        ...pageHtml.matchAll(/<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/gi)
      ];
      for (const row of rowMatches) {
        const rowHtml = row[1];
        if (rowHtml.includes('class="gsc_a_e"')) continue;
        const hrefMatch = rowHtml.match(
          /<a[^>]*href="([^"]+)"[^>]*class="gsc_a_at"/i
        );
        const rawHref = hrefMatch?.[1] ? decodeHtmlEntities(hrefMatch[1]) : "";
        const scholarUrl = rawHref ? rawHref.startsWith("http") ? rawHref : `https://scholar.google.com${rawHref}` : void 0;
        const tMatch = rowHtml.match(/class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/i);
        const rawTitle = decodeHtmlEntities(
          (tMatch?.[1] || "").replace(/<[^>]+>/g, " ")
        ).replace(/\s+/g, " ");
        if (!rawTitle || rawTitle.length < 6) continue;
        const grays = [
          ...rowHtml.matchAll(/class="gs_gray"[^>]*>([\s\S]*?)<\/div>/gi)
        ].map(
          (m) => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ")
        );
        const authorsText = grays[0] || "";
        const rawVenueLine = grays[1] || "";
        const venueText = rawVenueLine.replace(/,\s*\d{4}\s*$/, "").trim();
        const citMatch = rowHtml.match(
          /class="gsc_a_ac[^"]*"[^>]*>(\d+)<\/a>/i
        );
        const citations = citMatch?.[1] ? Number(citMatch[1]) : 0;
        if (shouldExcludeNonPaperRecord({
          title: rawTitle,
          venue: venueText,
          citations
        })) {
          continue;
        }
        const normTitleKey = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 48);
        if (seenNormTitles.has(normTitleKey)) {
          continue;
        }
        seenNormTitles.add(normTitleKey);
        const yrMatch = rowHtml.match(
          /class="gsc_a_h gsc_a_hc[^"]*"[^>]*>(\d{4})<\/span>/i
        );
        let year = yrMatch?.[1] ? Number(yrMatch[1]) : 0;
        if (!year) {
          const fallbackYr = rawVenueLine.match(/\b(19[89]\d|20[0-2]\d)\b/) || rawTitle.match(/\b(19[89]\d|20[0-2]\d)\b/);
          year = fallbackYr?.[1] ? Number(fallbackYr[1]) : 2020;
        }
        publications.push({
          title: rawTitle,
          authorsText,
          venueText: cleanVenueName(venueText),
          year,
          citations,
          scholarUrl
        });
      }
    }
    return {
      userId,
      name,
      affiliation,
      verifiedDomain,
      fields: fields.length > 0 ? fields : ["Research", "Engineering"],
      officialMetrics,
      sidebarCoAuthors,
      publications
    };
  } catch {
    return null;
  }
}
function tokenizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
}
var officialSourceByNameCache = /* @__PURE__ */ new Map();
async function resolveOfficialJournalMetricsByVenue(venueName, issn) {
  const clean = cleanVenueName(venueName);
  const key = clean.toLowerCase();
  if (!clean || key === "academic venue") return void 0;
  if (officialSourceByNameCache.has(key)) {
    return officialSourceByNameCache.get(key);
  }
  try {
    const queryUrl = issn ? `https://api.openalex.org/sources?filter=issn:${encodeURIComponent(
      issn
    )}&per-page=3&select=id,display_name,type,issn_l,issn,is_in_doaj,is_core,summary_stats,works_count` : `https://api.openalex.org/sources?search=${encodeURIComponent(
      clean
    )}&per-page=5&select=id,display_name,type,issn_l,issn,is_in_doaj,is_core,summary_stats,works_count`;
    const res = await fetch(queryUrl, {
      headers: {
        "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
      },
      signal: AbortSignal.timeout(3e3)
    });
    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const exactOrBest = results.find(
        (r) => String(r.display_name || "").toLowerCase() === key
      ) || results[0];
      if (exactOrBest) {
        const metrics = {
          id: String(exactOrBest.id || "").replace("https://openalex.org/", ""),
          display_name: String(exactOrBest.display_name || clean),
          type: exactOrBest.type ? String(exactOrBest.type) : void 0,
          issn_l: exactOrBest.issn_l || null,
          issns: Array.isArray(exactOrBest.issn) ? exactOrBest.issn : [],
          is_in_doaj: Boolean(exactOrBest.is_in_doaj),
          is_core: Boolean(exactOrBest.is_core),
          twoYrMeanCitedness: Number(
            exactOrBest.summary_stats?.["2yr_mean_citedness"] || 0
          ),
          hIndex: Number(exactOrBest.summary_stats?.h_index || 0),
          worksCount: Number(exactOrBest.works_count || 0)
        };
        officialSourceByNameCache.set(key, metrics);
        return metrics;
      }
    }
  } catch {
  }
  try {
    let resolvedIssns = issn ? [issn] : [];
    let resolvedTitle = clean;
    let totalDois = 0;
    if (resolvedIssns.length === 0) {
      const crJRes = await fetch(
        `https://api.crossref.org/journals?query=${encodeURIComponent(
          clean
        )}&rows=5&mailto=research@scholarlens.org`,
        {
          headers: {
            "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
          },
          signal: AbortSignal.timeout(4e3)
        }
      );
      if (crJRes.ok) {
        const crJData = await crJRes.json();
        const items = crJData?.message?.items || [];
        const normKey = key.replace(/[^a-z0-9]/g, "");
        const exact = items.find(
          (it) => String(it.title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normKey
        ) || items.find((it) => {
          const t = String(it.title || "").toLowerCase();
          return t.includes(key) || key.includes(t);
        }) || items[0];
        if (exact && Array.isArray(exact.ISSN) && exact.ISSN.length > 0) {
          resolvedIssns = exact.ISSN.map((x) => String(x));
          resolvedTitle = cleanVenueName(String(exact.title || clean));
          totalDois = Number(exact.counts?.["total-dois"] || 0);
        }
      }
    }
    if (resolvedIssns.length > 0) {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const fromYear = currentYear - 3;
      const issnFilter = resolvedIssns.map((id) => `issn:${encodeURIComponent(id)}`).join(",");
      const crWRes = await fetch(
        `https://api.crossref.org/works?filter=${issnFilter},from-pub-date:${fromYear}-01-01&sort=is-referenced-by-count&order=desc&rows=10&select=is-referenced-by-count&mailto=research@scholarlens.org`,
        {
          headers: {
            "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
          },
          signal: AbortSignal.timeout(6e3)
        }
      );
      if (crWRes.ok) {
        const crWData = await crWRes.json();
        const total3yr = Number(crWData?.message?.["total-results"] || 0);
        const works = crWData?.message?.items || [];
        const cits = works.map(
          (w) => Number(w["is-referenced-by-count"] || 0)
        );
        const top10Avg = cits.length > 0 ? cits.reduce((a, b) => a + b, 0) / cits.length : 0;
        let h3yr = 0;
        for (let i = 0; i < cits.length; i++) {
          if (cits[i] >= i + 1) h3yr = i + 1;
        }
        const crossrefNormScore = total3yr > 0 ? top10Avg / Math.pow(Math.log10(Math.max(15, total3yr)), 2.2) : 0;
        const metrics = {
          id: `ISSN:${resolvedIssns[0]}`,
          display_name: resolvedTitle,
          type: "journal",
          issn_l: resolvedIssns[0],
          issns: resolvedIssns,
          is_in_doaj: false,
          is_core: total3yr >= 40 || totalDois > 200,
          twoYrMeanCitedness: Number((crossrefNormScore / 4).toFixed(2)),
          hIndex: h3yr,
          worksCount: total3yr || totalDois || works.length,
          top10RecentCitAvg: top10Avg,
          crossrefNormScore
        };
        officialSourceByNameCache.set(key, metrics);
        return metrics;
      }
    }
  } catch {
  }
  return void 0;
}
async function queryCrossrefWorkByTitle(title) {
  try {
    const res = await fetch(
      `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(
        title
      )}&rows=2`,
      {
        headers: {
          "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
        },
        signal: AbortSignal.timeout(3e3)
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.message?.items || [];
    const gsTokens = new Set(tokenizeTitle(title));
    for (const item of items) {
      const crTitle = String(item.title?.[0] || "");
      const crTokens = tokenizeTitle(crTitle);
      if (crTokens.length < 3 || gsTokens.size < 3) continue;
      let overlap = 0;
      for (const t of crTokens) {
        if (gsTokens.has(t)) overlap++;
      }
      const score = overlap / Math.min(gsTokens.size, crTokens.length);
      if (score >= 0.75) {
        const doi = item.DOI ? String(item.DOI) : void 0;
        const url = item.resource?.primary?.URL || item.URL || (doi ? `https://doi.org/${doi}` : void 0);
        const venue = item["container-title"]?.[0] ? cleanVenueName(String(item["container-title"][0])) : void 0;
        const workType = item.type ? String(item.type) : void 0;
        const issn = item.ISSN?.[0] ? String(item.ISSN[0]) : void 0;
        const year = Number(
          item.published?.["date-parts"]?.[0]?.[0] || item["published-print"]?.["date-parts"]?.[0]?.[0] || item["published-online"]?.["date-parts"]?.[0]?.[0]
        ) || void 0;
        return { doi, url, venue, workType, issn, year };
      }
    }
  } catch {
  }
  return null;
}
function classifyPublicationType(sourceType, workType, venue, title) {
  const vLower = venue.toLowerCase();
  const tLower = title.toLowerCase();
  if (sourceType.includes("conference") || workType.includes("proceedings") || vLower.includes("conference") || vLower.includes("symposium") || vLower.includes("workshop") || vLower.includes("proceedings") || vLower.includes("congress") || vLower.includes("colloquium") || vLower.includes("oceans") || vLower.includes("cinti") || vLower.includes("icacte") || vLower.includes("caepia") || vLower.includes("society:") || vLower.includes("cvpr") || vLower.includes("neurips") || vLower.includes("icml") || vLower.includes("iclr") || vLower.includes("iccv") || vLower.includes("eccv") || vLower.includes("icassp") || vLower.includes("igarss") || vLower.includes("globecom") || vLower.includes("infocom") || vLower.includes("icra") || vLower.includes("iros") || vLower.includes("tencon") || vLower.includes("iccit") || vLower.includes("iceee") || vLower.includes("icrest") || vLower.includes("ic4ir") || vLower.includes("sti ") || vLower.includes("ieee") && (vLower.includes("international") || vLower.includes("conf") || vLower.includes("region") || vLower.includes("annual") || /\b20\d{2}\b/.test(vLower))) {
    return "Conference";
  }
  if (workType === "review" || tLower.includes("a review") || tLower.includes("comprehensive review") || tLower.includes("systematic review") || tLower.includes("survey")) {
    return "Review";
  }
  if (workType.includes("book") || sourceType.includes("book") || vLower.includes("lecture notes") || vLower.includes("advances in intelligent systems") || vLower.includes("springer nature") || vLower.includes("john wiley & sons") || vLower.includes("computer vision in vehicle technology") || vLower.includes("biometrics under biomedical")) {
    return "Book Chapter";
  }
  return "Journal";
}
function classifyQuartileFromOfficialMetrics(type, venue, sourceMetrics) {
  if (type !== "Journal" && type !== "Review") {
    return "Unranked";
  }
  const v = venue.toLowerCase().trim();
  if (!v || v === "academic venue" || sourceMetrics?.type === "repository") {
    return "Unranked";
  }
  if (!sourceMetrics) {
    return "Unranked";
  }
  const impact2Yr = sourceMetrics.twoYrMeanCitedness;
  const hIdx = sourceMetrics.hIndex;
  const normScore = sourceMetrics.crossrefNormScore;
  const worksCount = sourceMetrics.worksCount || 0;
  const hasIssn = Boolean(
    sourceMetrics.issn_l || sourceMetrics.issns && sourceMetrics.issns.length > 0
  );
  if (normScore !== void 0) {
    if (!hasIssn || worksCount < 30) return "Unranked";
    if (normScore >= 12 || normScore >= 4.8 && worksCount >= 800 || normScore >= 8 && worksCount < 8e3) {
      return "Q1";
    }
    if (normScore >= 4.2 || normScore >= 2.8 && worksCount >= 500) return "Q2";
    if (normScore >= 1.6) return "Q3";
    if (normScore >= 0.5 || hasIssn) return "Q4";
    return "Unranked";
  }
  if (!hasIssn && hIdx < 12 && impact2Yr < 0.4) {
    return "Unranked";
  }
  if (impact2Yr >= 2.5 || hIdx >= 55 || worksCount >= 1e3 && impact2Yr >= 2) {
    return "Q1";
  }
  if (impact2Yr >= 1.4 || hIdx >= 28) {
    return "Q2";
  }
  if (impact2Yr >= 0.7 || hIdx >= 14) {
    return "Q3";
  }
  if (hasIssn || impact2Yr >= 0.2 || hIdx >= 5 || sourceMetrics.is_core) {
    return "Q4";
  }
  return "Unranked";
}
function stripAcademicHonorifics(rawName) {
  return rawName.replace(/\([^)]*\)/g, " ").replace(
    /\b(?:prof(?:essor)?|assoc(?:iate)?\s+prof(?:essor)?|assist(?:ant)?\s+prof(?:essor)?|dr|engr|ir|ts|mr|mrs|ms|md\s+dr|phd|ph\.d\.|msc|b\.sc|fi?eee|smieee|mieee)\b\.?/gi,
    " "
  ).replace(/\s+/g, " ").trim();
}
function isSameResearcherName(candidateName, targetName) {
  const c = stripAcademicHonorifics(candidateName).toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const t = stripAcademicHonorifics(targetName).toLowerCase().replace(/[^a-z\s]/g, "").trim();
  if (!c || !t) return false;
  if (c === t) return true;
  const cNorm = c.replace(/v|w/g, "b");
  const tNorm = t.replace(/v|w/g, "b");
  if (cNorm === tNorm) return true;
  const tParts = t.split(/\s+/).filter((p) => p.length >= 4);
  if (tParts.length > 0) {
    const lastPart = tParts[tParts.length - 1];
    const lastPartNorm = lastPart.replace(/v|w/g, "b");
    if (c.includes(lastPart) || cNorm.includes(lastPartNorm)) {
      return true;
    }
  }
  return false;
}
function matchGsTitleToOpenAlexWork(gsTitle, oaWorks) {
  const gsNorm = gsTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (gsNorm.length < 5) return null;
  for (const w of oaWorks) {
    const oaTitle = String(w.title || w.display_name || "");
    const oaNorm = oaTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!oaNorm) continue;
    if (oaNorm === gsNorm || gsNorm.length >= 24 && oaNorm.length >= 24 && (oaNorm.includes(gsNorm.slice(0, 24)) || gsNorm.includes(oaNorm.slice(0, 24)))) {
      return w;
    }
  }
  const gsTokens = new Set(tokenizeTitle(gsTitle));
  if (gsTokens.size < 3) return null;
  let bestWork = null;
  let bestScore = 0;
  for (const w of oaWorks) {
    const oaTitle = String(w.title || w.display_name || "");
    const oaTokens = tokenizeTitle(oaTitle);
    if (oaTokens.length < 3) continue;
    let overlap = 0;
    for (const t of oaTokens) {
      if (gsTokens.has(t)) overlap++;
    }
    const score = overlap / Math.min(gsTokens.size, oaTokens.length);
    if (score > bestScore && score >= 0.72) {
      bestScore = score;
      bestWork = w;
    }
  }
  return bestWork;
}
async function resolveScholarIdViaWikidata(scholarId) {
  try {
    const sparql = `SELECT ?itemLabel WHERE { ?item wdt:P1960 "${scholarId.replace(
      /"/g,
      ""
    )}". SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } LIMIT 1`;
    const res = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
        sparql
      )}`,
      {
        headers: {
          "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
        },
        signal: AbortSignal.timeout(2500)
      }
    );
    if (res.ok) {
      const data = await res.json();
      const label = data?.results?.bindings?.[0]?.itemLabel?.value;
      if (label && typeof label === "string" && !/^Q\d+$/.test(label)) {
        return label;
      }
    }
  } catch {
  }
  return null;
}
async function buildLiveResearcherProfile(userIdInput, queryNameInput) {
  const scraped = userIdInput ? await scrapeGoogleScholarFullProfile(userIdInput) : null;
  let resolvedWikidataName = null;
  if (!scraped && !queryNameInput && userIdInput) {
    resolvedWikidataName = await resolveScholarIdViaWikidata(userIdInput);
  }
  const targetName = scraped?.name || queryNameInput || resolvedWikidataName || userIdInput;
  if (!targetName) return null;
  const openAlexAuthorIds = [];
  let primaryOpenAlexAuthor = null;
  const cleanSearchName = stripAcademicHonorifics(targetName) || targetName;
  try {
    const authorRes = await fetch(
      `https://api.openalex.org/authors?search=${encodeURIComponent(
        cleanSearchName
      )}&per-page=10`,
      {
        headers: {
          "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
        },
        signal: AbortSignal.timeout(6500)
      }
    );
    if (authorRes.ok) {
      const authorData = await authorRes.json();
      const results = Array.isArray(authorData?.results) ? authorData.results : [];
      for (const a of results) {
        const disp = String(a.display_name || "");
        if (isSameResearcherName(disp, cleanSearchName)) {
          const cleanId = String(a.id).replace("https://openalex.org/", "");
          if (!openAlexAuthorIds.includes(cleanId)) {
            openAlexAuthorIds.push(cleanId);
          }
          if (!primaryOpenAlexAuthor) {
            primaryOpenAlexAuthor = a;
          }
        }
      }
      if (!primaryOpenAlexAuthor && results[0]) {
        primaryOpenAlexAuthor = results[0];
        openAlexAuthorIds.push(
          String(results[0].id).replace("https://openalex.org/", "")
        );
      }
    }
  } catch {
  }
  let rawOaWorks = [];
  if (openAlexAuthorIds.length > 0) {
    try {
      const filterIds = openAlexAuthorIds.slice(0, 5).join("|");
      const worksRes = await fetch(
        `https://api.openalex.org/works?filter=author.id:${encodeURIComponent(
          filterIds
        )}&per-page=200`,
        {
          headers: {
            "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
          },
          signal: AbortSignal.timeout(8e3)
        }
      );
      if (worksRes.ok) {
        const worksData = await worksRes.json();
        rawOaWorks = Array.isArray(worksData?.results) ? worksData.results : [];
      }
    } catch {
      rawOaWorks = [];
    }
  }
  const gsMatchedOaWorkByIndex = /* @__PURE__ */ new Map();
  const strictScholarOaWorks = [];
  const seenOaWorkIds = /* @__PURE__ */ new Set();
  if (scraped && scraped.publications.length > 0) {
    for (let gIdx = 0; gIdx < scraped.publications.length; gIdx++) {
      const gsPub = scraped.publications[gIdx];
      const matchedW = matchGsTitleToOpenAlexWork(gsPub.title, rawOaWorks);
      if (matchedW) {
        gsMatchedOaWorkByIndex.set(gIdx, matchedW);
        const wId = String(matchedW.id || "");
        if (wId && !seenOaWorkIds.has(wId)) {
          seenOaWorkIds.add(wId);
          strictScholarOaWorks.push(matchedW);
        }
      }
    }
  }
  for (const w of rawOaWorks) {
    const wId = String(w.id || "");
    if (wId && seenOaWorkIds.has(wId)) continue;
    const wTitle = String(w.title || w.display_name || "");
    const wVenue = String(w.primary_location?.source?.display_name || "");
    const wType = String(w.type || "");
    const sType = String(w.primary_location?.source?.type || "");
    if (!shouldExcludeNonPaperRecord({
      title: wTitle,
      venue: wVenue,
      workType: wType,
      sourceType: sType,
      citations: Number(w.cited_by_count || 0)
    })) {
      if (wId) seenOaWorkIds.add(wId);
      strictScholarOaWorks.push(w);
    }
  }
  const instIdsSet = /* @__PURE__ */ new Set();
  const sourceIdsSet = /* @__PURE__ */ new Set();
  if (primaryOpenAlexAuthor?.last_known_institutions) {
    for (const inst of primaryOpenAlexAuthor.last_known_institutions) {
      if (inst?.id) {
        instIdsSet.add(String(inst.id).replace("https://openalex.org/", ""));
      }
    }
  }
  for (const w of strictScholarOaWorks) {
    const srcId = w.primary_location?.source?.id;
    if (srcId) {
      sourceIdsSet.add(String(srcId).replace("https://openalex.org/", ""));
    }
    for (const a of w.authorships || []) {
      for (const inst of a.institutions || []) {
        if (inst?.id) {
          instIdsSet.add(String(inst.id).replace("https://openalex.org/", ""));
        }
      }
    }
  }
  const geoCache = /* @__PURE__ */ new Map();
  const sourceMetricsCache = /* @__PURE__ */ new Map();
  const allInstIds = Array.from(instIdsSet);
  const allSourceIds = Array.from(sourceIdsSet);
  const batchPromises = [];
  for (let i = 0; i < allInstIds.length; i += 50) {
    const chunk = allInstIds.slice(i, i + 50);
    batchPromises.push(
      (async () => {
        try {
          const instRes = await fetch(
            `https://api.openalex.org/institutions?filter=openalex:${chunk.join(
              "|"
            )}&per-page=50&select=id,display_name,ror,country_code,geo`,
            {
              headers: {
                "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
              },
              signal: AbortSignal.timeout(4500)
            }
          );
          if (instRes.ok) {
            const instData = await instRes.json();
            for (const rec of instData?.results || []) {
              const shortId = String(rec.id).replace(
                "https://openalex.org/",
                ""
              );
              geoCache.set(shortId, rec);
            }
          }
        } catch {
        }
      })()
    );
  }
  for (let i = 0; i < allSourceIds.length; i += 50) {
    const chunk = allSourceIds.slice(i, i + 50);
    batchPromises.push(
      (async () => {
        try {
          const srcRes = await fetch(
            `https://api.openalex.org/sources?filter=openalex:${chunk.join(
              "|"
            )}&per-page=50&select=id,display_name,type,issn_l,issn,is_in_doaj,is_core,summary_stats,works_count`,
            {
              headers: {
                "User-Agent": "ScholarLens/2.0 (mailto:research@scholarlens.org)"
              },
              signal: AbortSignal.timeout(4500)
            }
          );
          if (srcRes.ok) {
            const srcData = await srcRes.json();
            for (const rec of srcData?.results || []) {
              const shortId = String(rec.id).replace(
                "https://openalex.org/",
                ""
              );
              const m = {
                id: shortId,
                display_name: cleanVenueName(String(rec.display_name || "")),
                type: rec.type ? String(rec.type) : void 0,
                issn_l: rec.issn_l || null,
                issns: Array.isArray(rec.issn) ? rec.issn : [],
                is_in_doaj: Boolean(rec.is_in_doaj),
                is_core: Boolean(rec.is_core),
                twoYrMeanCitedness: Number(
                  rec.summary_stats?.["2yr_mean_citedness"] || 0
                ),
                hIndex: Number(rec.summary_stats?.h_index || 0),
                worksCount: Number(rec.works_count || 0)
              };
              sourceMetricsCache.set(shortId, m);
              if (m.display_name) {
                officialSourceByNameCache.set(
                  m.display_name.toLowerCase(),
                  m
                );
              }
            }
          }
        } catch {
        }
      })()
    );
  }
  await Promise.all(batchPromises);
  let homeMapped;
  if (primaryOpenAlexAuthor?.last_known_institutions?.[0]) {
    const inst0 = primaryOpenAlexAuthor.last_known_institutions[0];
    const shortId = String(inst0.id || "").replace("https://openalex.org/", "");
    homeMapped = await resolveInstitutionFromOfficialSources(
      String(inst0.display_name || scraped?.affiliation || "Research University"),
      String(inst0.country_code || ""),
      shortId,
      geoCache
    );
  } else {
    const rawAffil = scraped?.affiliation || "University of Liberal Arts Bangladesh";
    const affilParts = rawAffil.split(",").map((s) => s.trim()).filter(Boolean);
    const uniCandidate = affilParts.find(
      (p) => /university|institute|college|school|academy|ulab|dtu|cnrs/i.test(p)
    ) || rawAffil;
    homeMapped = await resolveInstitutionFromOfficialSources(
      uniCandidate,
      "",
      void 0,
      geoCache
    );
  }
  const sidebarAuthorInstitution = /* @__PURE__ */ new Map();
  const knownByOaAuthorId = /* @__PURE__ */ new Map();
  const oaAuthorIdInstSet = /* @__PURE__ */ new Map();
  if (scraped?.sidebarCoAuthors) {
    for (const sAuth of scraped.sidebarCoAuthors) {
      if (!sAuth.affiliation) continue;
      const cleanedAffil = sAuth.affiliation.replace(
        /^.*?\b(?:at|of|from)\s+(?=[A-Z].*?(?:university|universitat|universiti|universit|institute|college|polytechnic|dtu|buet|ulab|iut|bubt|normale))/i,
        ""
      ).trim();
      const parts = cleanedAffil.split(/[,|-]/).map(
        (p) => p.replace(
          /^(?:associate|assistant|adjunct|visiting|emeritus|distinguished)?\s*(?:professor|lecturer|researcher|fellow|student|faculty|chair|dean|director|head)\s*(?:of\s+[A-Za-z&\s]+)?\s*(?:at\s+)?/i,
          ""
        ).trim()
      ).filter(Boolean);
      const uniPart = parts.find(
        (p) => /university|universitat|universiti|universit|institute of technology|college|polytechnic|dtu|buet|cuet|kuet|ruet|duet|sust|ulab|iut|bubt|aiub|iub|nsu|ewu|brac|diu|uiu|gub|normale/i.test(
          p
        )
      );
      if (uniPart && uniPart.length >= 3) {
        const mapped = await resolveInstitutionFromOfficialSources(
          uniPart,
          "",
          void 0,
          geoCache
        );
        if (mapped.universityId !== "unlisted") {
          sidebarAuthorInstitution.set(sAuth.name.toLowerCase().trim(), mapped);
        }
      }
    }
  }
  for (const w of strictScholarOaWorks) {
    const hasBangladeshiAuthor = (w.authorships || []).some(
      (au) => (au.institutions || []).some(
        (ins) => String(ins.country_code || "").toUpperCase() === "BD"
      )
    );
    for (const a of w.authorships || []) {
      const aName = String(a.author?.display_name || "").trim();
      const aId = String(a.author?.id || "").replace(
        "https://openalex.org/",
        ""
      );
      if (!aName || isSameResearcherName(aName, targetName)) continue;
      for (const inst of a.institutions || []) {
        if (!inst?.display_name) continue;
        let dispName = String(inst.display_name);
        let cCode = String(inst.country_code || "");
        let shortId = String(inst.id || "").replace(
          "https://openalex.org/",
          ""
        );
        if ((dispName === "East\u2013West University" || shortId === "I4210135468") && hasBangladeshiAuthor) {
          dispName = "East West University";
          cCode = "BD";
          shortId = "I885507782";
        }
        const mapped = await resolveInstitutionFromOfficialSources(
          dispName,
          cCode,
          shortId,
          geoCache
        );
        if (mapped.universityId !== "unlisted" && aId) {
          if (!oaAuthorIdInstSet.has(aId)) {
            oaAuthorIdInstSet.set(aId, /* @__PURE__ */ new Set());
          }
          oaAuthorIdInstSet.get(aId).add(mapped.universityId);
          if (!knownByOaAuthorId.has(aId)) {
            knownByOaAuthorId.set(aId, mapped);
          }
        }
      }
    }
  }
  async function extractOaWorkDetails(w) {
    const year = Number(w.publication_year) || 0;
    const source = w.primary_location?.source;
    const sourceId = source?.id ? String(source.id).replace("https://openalex.org/", "") : void 0;
    const venue = cleanVenueName(
      String(source?.display_name || w.type_crossref || "Academic Venue")
    );
    const sourceType = String(source?.type || "").toLowerCase();
    const workType = String(w.type || "").toLowerCase();
    const authorships = Array.isArray(w.authorships) ? w.authorships : [];
    let authorshipRole = "Co-Author";
    const selfAuthorship = authorships.find((a) => {
      const aId = String(a.author?.id || "").replace(
        "https://openalex.org/",
        ""
      );
      const aName = String(a.author?.display_name || "");
      return openAlexAuthorIds.includes(aId) || isSameResearcherName(aName, targetName);
    });
    if (selfAuthorship?.author_position === "first") {
      authorshipRole = "First Author";
    } else if (selfAuthorship?.is_corresponding || selfAuthorship?.author_position === "last") {
      authorshipRole = "Corresponding Author";
    }
    const hasBangladeshiAuthor = authorships.some(
      (au) => (au.institutions || []).some(
        (ins) => String(ins.country_code || "").toUpperCase() === "BD"
      )
    );
    const coAuthors = [];
    const seenAuthorInstKeys = /* @__PURE__ */ new Set();
    for (const a of authorships) {
      const aName = String(a.author?.display_name || "").trim();
      const aId = String(a.author?.id || "").replace(
        "https://openalex.org/",
        ""
      );
      if (!aName || isSameResearcherName(aName, targetName)) continue;
      const rawInsts = Array.isArray(a.institutions) ? a.institutions.filter((i) => i?.display_name) : [];
      const filteredInsts = rawInsts.filter((inst) => {
        const dName = String(inst.display_name || "");
        if (/\bsystem$/i.test(dName) && rawInsts.length > 1) {
          return false;
        }
        return true;
      });
      if (filteredInsts.length > 0) {
        for (const inst of filteredInsts) {
          let dispName = String(inst.display_name);
          let cCode = String(inst.country_code || "");
          let shortId = String(inst.id || "").replace(
            "https://openalex.org/",
            ""
          );
          if ((dispName === "East\u2013West University" || shortId === "I4210135468") && hasBangladeshiAuthor) {
            dispName = "East West University";
            cCode = "BD";
            shortId = "I885507782";
          }
          const mapped = await resolveInstitutionFromOfficialSources(
            dispName,
            cCode,
            shortId,
            geoCache
          );
          const dedupKey = `${aName.toLowerCase()}::${mapped.universityId}`;
          if (seenAuthorInstKeys.has(dedupKey)) continue;
          seenAuthorInstKeys.add(dedupKey);
          coAuthors.push({
            name: aName,
            ...mapped,
            isHomeInstitution: mapped.universityId === homeMapped.universityId
          });
        }
      } else {
        let mapped = null;
        if (aId && knownByOaAuthorId.has(aId) && (oaAuthorIdInstSet.get(aId)?.size || 0) === 1) {
          mapped = knownByOaAuthorId.get(aId);
        } else if (sidebarAuthorInstitution.has(aName.toLowerCase())) {
          mapped = sidebarAuthorInstitution.get(aName.toLowerCase());
        }
        const dedupKey = `${aName.toLowerCase()}::${mapped?.universityId || "unlisted"}`;
        if (seenAuthorInstKeys.has(dedupKey)) continue;
        seenAuthorInstKeys.add(dedupKey);
        if (mapped) {
          coAuthors.push({
            name: aName,
            ...mapped,
            isHomeInstitution: mapped.universityId === homeMapped.universityId
          });
        } else {
          coAuthors.push({
            name: aName,
            universityId: "unlisted",
            universityName: "Independent / Unlisted",
            city: "Unlisted",
            country: "Unlisted",
            countryCode: "UN",
            continent: "Asia",
            lat: 0,
            lng: 0,
            isHomeInstitution: false
          });
        }
      }
    }
    const rawLanding = w.primary_location?.landing_page_url ? String(w.primary_location.landing_page_url) : void 0;
    const cleanDoi = w.doi ? String(w.doi).replace("https://doi.org/", "") : void 0;
    return {
      venue,
      sourceId,
      sourceType,
      workType,
      authorshipRole,
      openAccess: Boolean(w.open_access?.is_oa),
      doi: cleanDoi,
      landingPageUrl: (cleanDoi ? `https://doi.org/${cleanDoi}` : void 0) || rawLanding,
      year,
      coAuthors
    };
  }
  function parseScholarCoAuthors(authorsText) {
    const rawAuthorParts = authorsText.split(",").map((s) => s.trim()).filter((s) => s && s !== "..." && !isSameResearcherName(s, targetName));
    const coAuthors = [];
    const seenCoAuthorNames = /* @__PURE__ */ new Set();
    for (const rawAuth of rawAuthorParts) {
      const lower = rawAuth.toLowerCase().trim();
      const matchedInst = sidebarAuthorInstitution.get(lower) || null;
      if (seenCoAuthorNames.has(lower)) continue;
      seenCoAuthorNames.add(lower);
      if (matchedInst) {
        coAuthors.push({
          name: rawAuth,
          ...matchedInst,
          isHomeInstitution: matchedInst.universityId === homeMapped.universityId
        });
      } else {
        coAuthors.push({
          name: rawAuth,
          universityId: "unlisted",
          universityName: "Independent / Unlisted",
          city: "Unlisted",
          country: "Unlisted",
          countryCode: "UN",
          continent: "Asia",
          lat: 0,
          lng: 0,
          isHomeInstitution: false
        });
      }
    }
    return coAuthors;
  }
  const finalPublications = [];
  if (scraped && scraped.publications.length > 0) {
    for (let gIdx = 0; gIdx < scraped.publications.length; gIdx++) {
      const gsPub = scraped.publications[gIdx];
      const matchedOaWork = gsMatchedOaWorkByIndex.get(gIdx);
      if (matchedOaWork) {
        const oaDetails = await extractOaWorkDetails(matchedOaWork);
        const venue = cleanVenueName(
          oaDetails.venue && oaDetails.venue !== "Academic Venue" ? oaDetails.venue : gsPub.venueText && gsPub.venueText !== "Academic Venue" && !gsPub.venueText.endsWith("...") ? gsPub.venueText : oaDetails.venue
        );
        if (shouldExcludeNonPaperRecord({
          title: gsPub.title,
          venue,
          workType: oaDetails.workType,
          sourceType: oaDetails.sourceType,
          citations: gsPub.citations
        })) {
          continue;
        }
        const year = gsPub.year || oaDetails.year || 2020;
        const citations = gsPub.citations;
        let srcMetrics = oaDetails.sourceId ? sourceMetricsCache.get(oaDetails.sourceId) : void 0;
        if (!srcMetrics && venue !== "Academic Venue") {
          srcMetrics = await resolveOfficialJournalMetricsByVenue(venue);
        }
        const type = classifyPublicationType(
          oaDetails.sourceType,
          oaDetails.workType,
          venue,
          gsPub.title
        );
        const quartile = classifyQuartileFromOfficialMetrics(
          type,
          venue,
          srcMetrics
        );
        const paperUrl = oaDetails.landingPageUrl || gsPub.scholarUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(
          gsPub.title
        )}`;
        finalPublications.push({
          id: `gs-${gIdx}`,
          title: gsPub.title,
          year,
          citations,
          venue,
          quartile,
          type,
          authorshipRole: oaDetails.authorshipRole,
          openAccess: oaDetails.openAccess,
          doi: oaDetails.doi,
          url: paperUrl,
          coAuthors: oaDetails.coAuthors
        });
      } else {
        const crossref = await queryCrossrefWorkByTitle(gsPub.title);
        const cleanVenue = cleanVenueName(
          crossref?.venue || gsPub.venueText || "Academic Venue"
        );
        if (shouldExcludeNonPaperRecord({
          title: gsPub.title,
          venue: cleanVenue,
          workType: crossref?.workType,
          citations: gsPub.citations
        })) {
          continue;
        }
        const coAuthors = parseScholarCoAuthors(gsPub.authorsText);
        const type = classifyPublicationType(
          "",
          crossref?.workType || "",
          cleanVenue,
          gsPub.title
        );
        const srcMetrics = type === "Journal" || type === "Review" ? await resolveOfficialJournalMetricsByVenue(
          cleanVenue,
          crossref?.issn
        ) : void 0;
        const quartile = classifyQuartileFromOfficialMetrics(
          type,
          cleanVenue,
          srcMetrics
        );
        const paperUrl = crossref?.url || gsPub.scholarUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(
          gsPub.title
        )}`;
        finalPublications.push({
          id: `gs-${gIdx}`,
          title: gsPub.title,
          year: gsPub.year || crossref?.year || 2020,
          citations: gsPub.citations,
          venue: cleanVenue,
          quartile,
          type,
          authorshipRole: gsPub.authorsText.toLowerCase().startsWith(targetName.split(" ").pop()?.toLowerCase() || "___") ? "First Author" : "Co-Author",
          openAccess: Boolean(srcMetrics?.is_in_doaj),
          doi: crossref?.doi,
          url: paperUrl,
          coAuthors
        });
      }
    }
  } else {
    for (let idx = 0; idx < strictScholarOaWorks.length; idx++) {
      const w = strictScholarOaWorks[idx];
      const oaDetails = await extractOaWorkDetails(w);
      const title = String(
        w.title || w.display_name || `Publication #${idx + 1}`
      ).trim();
      const citations = Number(w.cited_by_count) || 0;
      if (shouldExcludeNonPaperRecord({
        title,
        venue: oaDetails.venue,
        workType: oaDetails.workType,
        sourceType: oaDetails.sourceType,
        citations
      })) {
        continue;
      }
      let srcMetrics = oaDetails.sourceId ? sourceMetricsCache.get(oaDetails.sourceId) : void 0;
      if (!srcMetrics && oaDetails.venue !== "Academic Venue") {
        srcMetrics = await resolveOfficialJournalMetricsByVenue(
          oaDetails.venue
        );
      }
      const type = classifyPublicationType(
        oaDetails.sourceType,
        oaDetails.workType,
        oaDetails.venue,
        title
      );
      const quartile = classifyQuartileFromOfficialMetrics(
        type,
        oaDetails.venue,
        srcMetrics
      );
      const paperUrl = oaDetails.landingPageUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;
      finalPublications.push({
        id: String(w.id || `oa-${idx}`).replace("https://openalex.org/", ""),
        title,
        year: oaDetails.year || 2020,
        citations,
        venue: oaDetails.venue,
        quartile,
        type,
        authorshipRole: oaDetails.authorshipRole,
        openAccess: oaDetails.openAccess,
        doi: oaDetails.doi,
        url: paperUrl,
        coAuthors: oaDetails.coAuthors
      });
    }
  }
  if (finalPublications.length === 0) {
    return null;
  }
  finalPublications.sort(
    (a, b) => b.citations - a.citations || b.year - a.year
  );
  const orcidRaw = primaryOpenAlexAuthor?.orcid ? String(primaryOpenAlexAuthor.orcid).replace("https://orcid.org/", "") : void 0;
  const openAlexTopics = Array.isArray(primaryOpenAlexAuthor?.topics) ? primaryOpenAlexAuthor.topics.slice(0, 4).map((t) => String(t.display_name)) : [];
  const cleanScholarId = scraped?.userId || userIdInput || slugifyInstitution(targetName).slice(0, 12);
  const profile = {
    id: `scholar-${cleanScholarId}`,
    scholarUserId: cleanScholarId,
    scholarUrl: `https://scholar.google.com/citations?user=${encodeURIComponent(
      cleanScholarId
    )}&hl=en`,
    name: scraped?.name || primaryOpenAlexAuthor?.display_name || targetName,
    affiliation: scraped?.affiliation || `${homeMapped.universityName} (${homeMapped.country})`,
    homeUniversityId: homeMapped.universityId,
    homeUniversity: homeMapped.universityName,
    homeCity: homeMapped.city,
    homeCountry: homeMapped.country,
    homeLat: homeMapped.lat,
    homeLng: homeMapped.lng,
    verifiedDomain: scraped?.verifiedDomain || `${homeMapped.universityId}.edu`,
    orcid: orcidRaw,
    fields: scraped && scraped.fields.length > 0 ? scraped.fields : openAlexTopics.length > 0 ? openAlexTopics : ["Engineering", "Computer Science"],
    officialMetrics: scraped?.officialMetrics,
    publications: finalPublications
  };
  return {
    profile,
    source: scraped ? "google-scholar-official" : "openalex-official"
  };
}
var profileCache = /* @__PURE__ */ new Map();
var rawSnapshot = verifiedScholarCache_default;
if (rawSnapshot && typeof rawSnapshot === "object") {
  for (const [snapKey, snapVal] of Object.entries(rawSnapshot)) {
    const prof = snapVal?.profile || (snapVal?.publications ? snapVal : void 0);
    if (!prof || !prof.name) continue;
    const payload = {
      profile: prof,
      source: "scholar-verified-official-cache"
    };
    const uId = (prof.scholarUserId || snapKey).toLowerCase().trim();
    const pName = prof.name.toLowerCase().trim();
    if (uId) {
      profileCache.set(`${uId}::`, {
        timestamp: Date.now(),
        data: payload
      });
    }
    if (pName) {
      profileCache.set(`::${pName}`, {
        timestamp: Date.now(),
        data: payload
      });
    }
    if (uId && pName) {
      profileCache.set(`${uId}::${pName}`, {
        timestamp: Date.now(),
        data: payload
      });
    }
  }
}
var app = express();
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ScholarLens Analytics API" });
});
var cachedBridgeToken = null;
async function getBridgeIdToken() {
  if (cachedBridgeToken && Date.now() < cachedBridgeToken.expiresAt) {
    return cachedBridgeToken.token;
  }
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebase_applet_config_default.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "worker-bridge@scholarlens.org",
          password: "ScholarBridge#2026!Secure",
          returnSecureToken: true
        }),
        signal: AbortSignal.timeout(3e3)
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data?.idToken) {
      cachedBridgeToken = {
        token: String(data.idToken),
        expiresAt: Date.now() + 45 * 60 * 1e3
      };
      return cachedBridgeToken.token;
    }
  } catch {
  }
  return null;
}
var FIRESTORE_DOC_BASE = `https://firestore.googleapis.com/v1/projects/${firebase_applet_config_default.projectId}/databases/${firebase_applet_config_default.firestoreDatabaseId}/documents`;
function sanitizeBridgeDocId(userId, queryName) {
  const raw = (userId || queryName || "default").trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 96);
  return raw || "default";
}
async function writeScholarBridgeDoc(docId, userId, queryName, status, payloadJson) {
  const token = await getBridgeIdToken();
  if (!token) return false;
  try {
    const safePayload = payloadJson.length <= 85e4 ? payloadJson : "";
    const finalStatus = status === "ready" && !safePayload ? "error" : status;
    const resp = await fetch(`${FIRESTORE_DOC_BASE}/scholarBridge/${docId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          userId: { stringValue: (userId || docId).slice(0, 120) },
          queryName: { stringValue: (queryName || "").slice(0, 150) },
          status: { stringValue: finalStatus },
          payloadJson: { stringValue: safePayload },
          updatedAtMs: { integerValue: String(Date.now()) }
        }
      }),
      signal: AbortSignal.timeout(3500)
    });
    return resp.ok;
  } catch {
    return false;
  }
}
async function readScholarBridgeDoc(docId) {
  const token = await getBridgeIdToken();
  if (!token) return null;
  try {
    const resp = await fetch(`${FIRESTORE_DOC_BASE}/scholarBridge/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2500)
    });
    if (!resp.ok) return null;
    const doc = await resp.json();
    const fields = doc?.fields;
    if (!fields) return null;
    return {
      status: String(fields.status?.stringValue || ""),
      payloadJson: String(fields.payloadJson?.stringValue || ""),
      updatedAtMs: Number(fields.updatedAtMs?.integerValue || 0)
    };
  } catch {
    return null;
  }
}
async function resolveViaScholarBridge(userId, queryName) {
  const docId = sanitizeBridgeDocId(userId, queryName);
  const existing = await readScholarBridgeDoc(docId);
  if (existing && existing.status === "ready" && existing.payloadJson && Date.now() - existing.updatedAtMs < 24 * 60 * 60 * 1e3) {
    try {
      return JSON.parse(existing.payloadJson);
    } catch {
    }
  }
  if (process.env.VERCEL) {
    return null;
  }
  const queued = await writeScholarBridgeDoc(
    docId,
    userId || docId,
    queryName,
    "pending",
    ""
  );
  if (!queued) return null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise((r) => setTimeout(r, 380));
    const current = await readScholarBridgeDoc(docId);
    if (current?.status === "ready" && current.payloadJson) {
      try {
        return JSON.parse(current.payloadJson);
      } catch {
        return null;
      }
    }
    if (current?.status === "error") {
      return null;
    }
  }
  return null;
}
var isWorkerPolling = false;
function startScholarBridgeWorker() {
  if (process.env.VERCEL) return;
  setInterval(async () => {
    if (isWorkerPolling) return;
    isWorkerPolling = true;
    try {
      const token = await getBridgeIdToken();
      if (!token) return;
      const queryResp = await fetch(`${FIRESTORE_DOC_BASE}:runQuery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "scholarBridge" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "pending" }
              }
            },
            limit: 3
          }
        }),
        signal: AbortSignal.timeout(3e3)
      });
      if (!queryResp.ok) return;
      const rows = await queryResp.json();
      for (const row of rows) {
        const doc = row?.document;
        if (!doc?.name || !doc?.fields) continue;
        const docId = String(doc.name).split("/").pop() || "";
        const uId = String(doc.fields.userId?.stringValue || "");
        const qName = String(doc.fields.queryName?.stringValue || "");
        const built = await buildLiveResearcherProfile(uId, qName);
        if (built) {
          await writeScholarBridgeDoc(
            docId,
            uId,
            qName,
            "ready",
            JSON.stringify(built)
          );
        } else {
          await writeScholarBridgeDoc(docId, uId, qName, "error", "");
        }
      }
    } catch {
    } finally {
      isWorkerPolling = false;
    }
  }, 650);
}
app.get("/api/scholar/analyze", async (req, res) => {
  const userId = String(req.query.userId || "").trim();
  const queryName = String(req.query.queryName || "").trim();
  const forceRefresh = req.query.refresh === "1";
  if (!userId && !queryName) {
    res.status(400).json({ error: "Paste a Google Scholar profile link or researcher name." });
    return;
  }
  const cacheKey = `${userId.toLowerCase()}::${queryName.toLowerCase()}`;
  const cached = profileCache.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1e3) {
    res.json(cached.data);
    return;
  }
  if (!forceRefresh) {
    const rawSnap = verifiedScholarCache_default;
    const lowerUser = userId.toLowerCase().trim();
    const lowerQuery = queryName.toLowerCase().trim();
    let snapMatch;
    if (rawSnap && typeof rawSnap === "object") {
      for (const [snapKey, snapVal] of Object.entries(rawSnap)) {
        const prof = snapVal?.profile || (snapVal?.publications ? snapVal : void 0);
        if (!prof) continue;
        const candidateId = (prof.scholarUserId || snapKey).toLowerCase().trim();
        const candidateName = prof.name ? prof.name.toLowerCase().trim() : "";
        if (lowerUser && (candidateId === lowerUser || candidateId.includes(lowerUser) || lowerUser.includes(candidateId)) || lowerQuery && candidateName && (candidateName === lowerQuery || candidateName.includes(lowerQuery) || lowerQuery.includes(candidateName))) {
          snapMatch = prof;
          break;
        }
      }
    }
    if (snapMatch) {
      const snapPayload = {
        profile: snapMatch,
        source: "scholar-verified-official-snapshot"
      };
      profileCache.set(cacheKey, {
        timestamp: Date.now(),
        data: snapPayload
      });
      res.json(snapPayload);
      return;
    }
  }
  try {
    if (process.env.VERCEL && userId) {
      const bridged = await resolveViaScholarBridge(userId, queryName);
      if (bridged && bridged.profile) {
        profileCache.set(cacheKey, {
          timestamp: Date.now(),
          data: bridged
        });
        res.json(bridged);
        return;
      }
    }
    const result = await buildLiveResearcherProfile(userId, queryName);
    if (!result) {
      res.status(404).json({
        error: "Could not find public publications for that Google Scholar profile."
      });
      return;
    }
    profileCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });
    if (userId) {
      const docId = sanitizeBridgeDocId(userId, queryName);
      void writeScholarBridgeDoc(
        docId,
        userId,
        queryName,
        "ready",
        JSON.stringify(result)
      );
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to analyze Google Scholar profile." });
  }
});
async function startServer() {
  startScholarBridgeWorker();
  const PORT = Number(process.env.PORT) || 3e3;
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ScholarLens server running on http://localhost:${PORT}`);
    });
  }
}
if (!process.env.VERCEL) {
  void startServer();
}
var server_default = app;
export {
  app,
  buildLiveResearcherProfile,
  cleanVenueName,
  server_default as default,
  shouldExcludeNonPaperRecord
};
