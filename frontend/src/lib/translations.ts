export type Language = "en" | "mr" | "hi";

export interface Translations {
  appName: string;
  tagline: string;
  navHome: string;
  navTree: string;
  navAssess: string;
  navReport: string;
  navPredict: string;
  navProfile: string;
  // Landing
  heroTitle: string;
  heroSubtitle: string;
  ctaStartTree: string;
  ctaFastScreen: string;
  badgeHackathon: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  // Canvas / Tree
  treeTitle: string;
  treeSubtitle: string;
  addRelative: string;
  selfNode: string;
  father: string;
  mother: string;
  brother: string;
  sister: string;
  grandfather: string;
  grandmother: string;
  child: string;
  conditions: string;
  diabetes: string;
  hypertension: string;
  heartDisease: string;
  stroke: string;
  respiratory: string;
  ageYears: string;
  isAlive: string;
  save: string;
  cancel: string;
  delete: string;
  close: string;
  // Assessment
  assessTitle: string;
  assessSubtitle: string;
  waistCircumference: string;
  waistHelp: string;
  physicalActivity: string;
  vigorous: string;
  moderate: string;
  sedentary: string;
  tobaccoHabit: string;
  yes: string;
  no: string;
  selectDistrict: string;
  aqiImpact: string;
  calculateRisk: string;
  calculating: string;
  // Dashboard & Report
  resultsTitle: string;
  idrsScore: string;
  mlDiabetesScore: string;
  mlCvdScore: string;
  riskLow: string;
  riskModerate: string;
  riskHigh: string;
  doctorTriageBrief: string;
  downloadPdf: string;
  dietAdviceTitle: string;
  dietAdviceSub: string;
  offlineNotice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Fedigree",
    tagline: "Family Health Tree & NCD Preventive Care Platform for India",
    navHome: "Home",
    navTree: "Family Tree",
    navAssess: "Health Assessment",
    navReport: "Doctor Triage Brief",
    navPredict: "ML Diabetes Test",
    navProfile: "Health Profile",
    heroTitle: "Prevent NCDs Before They Start Across Generations",
    heroSubtitle: "Mapping 3-generation Indian family health history with the ICMR-validated Indian Diabetes Risk Score (IDRS), AI/ML models, and Maharashtra live environmental AQI.",
    ctaStartTree: "Build Family Tree",
    ctaFastScreen: "2-Min Quick Screening",
    badgeHackathon: "SEVA Innovation Challenge 2026 • Category 4: NCDs",
    feature1Title: "Interactive Pedigree Canvas",
    feature1Desc: "Visualize hereditary clusters of Diabetes, Early Heart Attack, and Hypertension across 3 generations.",
    feature2Title: "Dual-Engine AI & Clinical Scoring",
    feature2Desc: "Combines the ICMR-INDIAB validated IDRS algorithm with LASI Indian demographic ML models.",
    feature3Title: "1-Page Doctor OPD Triage",
    feature3Desc: "Instant printable clinical summary designed for rapid 2-minute OPD consultations at PHCs and clinics.",
    treeTitle: "Interactive Family Health Canvas",
    treeSubtitle: "Click on any node to view history or add relatives to calculate generational hereditary load.",
    addRelative: "Add Relative",
    selfNode: "Self (You)",
    father: "Father",
    mother: "Mother",
    brother: "Brother",
    sister: "Sister",
    grandfather: "Grandfather",
    grandmother: "Grandmother",
    child: "Child",
    conditions: "Diagnosed Conditions",
    diabetes: "Type 2 Diabetes",
    hypertension: "Hypertension / High BP",
    heartDisease: "Early Heart Attack (CAD)",
    stroke: "Stroke",
    respiratory: "Chronic Asthma / COPD",
    ageYears: "Age (Years)",
    isAlive: "Living",
    save: "Save to Tree",
    cancel: "Cancel",
    delete: "Delete Node",
    close: "Close",
    assessTitle: "Non-Invasive Biometrics & Lifestyle Intake",
    assessSubtitle: "No blood test needed. Calculate your exact metabolic and environmental risk in under 2 minutes.",
    waistCircumference: "Waist Circumference (cm)",
    waistHelp: "Indian visceral adiposity threshold: Normal <80cm (F) / <80cm (M), High risk ≥90cm (M) / ≥80cm (F).",
    physicalActivity: "Daily Physical Activity",
    vigorous: "Vigorous (Strenuous labor, cycling, farming, brisk sports)",
    moderate: "Moderate (Brisk walking, brisk housework >30 mins/day)",
    sedentary: "Sedentary (Desk work, sitting >6 hours/day)",
    tobaccoHabit: "Do you consume tobacco, bidi, gutka or cigarettes?",
    yes: "Yes",
    no: "No",
    selectDistrict: "Select Maharashtra District / Zone",
    aqiImpact: "Real-time Air Quality Exposure",
    calculateRisk: "Calculate Comprehensive Risk",
    calculating: "Processing Clinical Models...",
    resultsTitle: "Personalized NCD Risk Stratification",
    idrsScore: "Indian Diabetes Risk Score (IDRS)",
    mlDiabetesScore: "LASI Demographic ML Diabetes Classifier",
    mlCvdScore: "LASI Cardiovascular Composite Score",
    riskLow: "Low Risk",
    riskModerate: "Moderate Risk",
    riskHigh: "High Risk",
    doctorTriageBrief: "1-Page Doctor OPD Triage Brief",
    downloadPdf: "Download Printable Clinical PDF",
    dietAdviceTitle: "ICMR-NIN Cultural Dietary Guidelines",
    dietAdviceSub: "Tailored nutritional substitutions for Maharashtrian diets.",
    offlineNotice: "Backend offline? Seamlessly calculating locally using pure client-side IDRS engine."
  },
  mr: {
    appName: "फेडीग्री (Fedigree)",
    tagline: "भारतासाठी कौटुंबिक आरोग्य वृक्ष आणि जीवनशैली आजार प्रतिबंधक मंच",
    navHome: "मुख्यपृष्ठ",
    navTree: "कौटुंबिक वृक्ष",
    navAssess: "आरोग्य तपासणी",
    navReport: "डॉक्टर अहवाल",
    navPredict: "ML मधुमेह चाचणी",
    navProfile: "आरोग्य प्रोफाइल",
    heroTitle: "पिढ्यानपिढ्या होणारे जीवनशैली आजार वेळेआधीच ओळखा व टाळा",
    heroSubtitle: "३ पिढ्यांचा कौटुंबिक इतिहास, ICMR प्रमाणित भारतीय मधुमेह जोखीम गुण (IDRS), ML मॉडेल्स आणि महाराष्ट्रातील हवेची गुणवत्ता (AQI) यांचा संगम.",
    ctaStartTree: "कौटुंबिक वृक्ष तयार करा",
    ctaFastScreen: "२ मिनिटांत त्वरित तपासणी",
    badgeHackathon: "सेवा नवकल्पना स्पर्धा २०२६ • गट ४: गैर-संसर्गजन्य आजार (NCDs)",
    feature1Title: "परस्परसंवादी कौटुंबिक वृक्ष",
    feature1Desc: "मधुमेह, हृदयविकार आणि उच्च रक्तदाबाचे पिढ्यानपिढ्यांचे प्रमाण एका दृष्टीक्षेपात पहा.",
    feature2Title: "ICMR प्रमाणित व AI/ML प्रणाली",
    feature2Desc: "डॉ. व्ही. मोहन व ICMR द्वारे प्रमाणित IDRS सूत्र आणि LASI भारतीय मॉडेलवर आधारित अचूक विश्लेषण.",
    feature3Title: "१-पानाचा डॉक्टर ओपीडी अहवाल",
    feature3Desc: "प्राथमिक आरोग्य केंद्र (PHC) किंवा दवाखान्यातील डॉक्टरांसाठी २ मिनिटांत वाचता येणारा मुद्रणयोग्य अहवाल.",
    treeTitle: "कौटुंबिक आरोग्य वृक्ष (Family Canvas)",
    treeSubtitle: "नातेवाईक जोडण्यासाठी किंवा माहिती पाहण्यासाठी कोणत्याही व्यक्तीवर क्लिक करा.",
    addRelative: "नातेवाईक जोडा",
    selfNode: "स्वतः (Self)",
    father: "वडील (Father)",
    mother: "आई (Mother)",
    brother: "भाऊ (Brother)",
    sister: "बहीण (Sister)",
    grandfather: "आजोबा (Grandfather)",
    grandmother: "आजी (Grandmother)",
    child: "मुलगा / मुलगी (Child)",
    conditions: "निदान झालेले आजार",
    diabetes: "मधुमेह (Type 2 Diabetes)",
    hypertension: "उच्च रक्तदाब (High BP)",
    heartDisease: "हृदयविकार / हार्ट अटॅक (CAD)",
    stroke: "पक्षाघात (Stroke)",
    respiratory: "दमा / श्वसनविकार (Asthma/COPD)",
    ageYears: "वय (वर्षे)",
    isAlive: "हयात आहेत",
    save: "वृक्षात जतन करा",
    cancel: "रद्द करा",
    delete: "काढून टाका",
    close: "बंद करा",
    assessTitle: "विना-तपासणी (Non-Invasive) आरोग्य माहिती",
    assessSubtitle: "रक्त तपासणीशिवाय अवघ्या २ मिनिटांत मधुमेह आणि हृदयविकाराचा संभाव्य धोका जाणून घ्या.",
    waistCircumference: "कमरेचा घेर (सेमी मध्ये)",
    waistHelp: "भारतीय मानके: सामान्य <८० सेमी (महिला/पुरुष), मध्यम ८०-८९ सेमी, जास्त धोका ≥९० सेमी.",
    physicalActivity: "दैनंदिन शारीरिक हालचाल / व्यायाम",
    vigorous: "कष्टाचे काम / जोरदार व्यायाम (शेती, सायकलिंग, धावणे)",
    moderate: "मध्यम काम (रोज ३० मिनिटे चालणे, घरकाम)",
    sedentary: "बैठी जीवनशैली (दिवसभरात एकाच जागी बसून काम)",
    tobaccoHabit: "तुम्ही तंबाखू, विडी, गुटखा किंवा सिगारेटचे सेवन करता का?",
    yes: "होय",
    no: "नाही",
    selectDistrict: "महाराष्ट्रातील तुमचा जिल्हा निवडा",
    aqiImpact: "परिसरातील हवेची गुणवत्ता (AQI)",
    calculateRisk: "एकूण जोखीम मोजा",
    calculating: "विश्लेषण सुरू आहे...",
    resultsTitle: "वैयक्तिक आरोग्य जोखीम विश्लेषण",
    idrsScore: "भारतीय मधुमेह जोखीम गुण (IDRS)",
    mlDiabetesScore: "LASI मशीन लर्निंग मधुमेह अंदाज",
    mlCvdScore: "LASI हृदयविकार संयुक्त गुण",
    riskLow: "कमी जोखीम (Low)",
    riskModerate: "मध्यम जोखीम (Moderate)",
    riskHigh: "उच्च जोखीम (High)",
    doctorTriageBrief: "१-पानाचा डॉक्टर तपासणी अहवाल",
    downloadPdf: "डॉक्टर अहवाल PDF डाउनलोड करा",
    dietAdviceTitle: "ICMR-NIN आहार व जीवनशैली मार्गदर्शन",
    dietAdviceSub: "महाराष्ट्रीयन आहारासाठी ज्वारी/बाजरी भाकरी, तेल व मिठाचे प्रमाण यांचे व्यावहारिक नियोजन.",
    offlineNotice: "इंटरनेट किंवा सर्व्हर नसला तरीही ही तपासणी तुमच्या फोनमध्ये ऑफलाइन चालते."
  },
  hi: {
    appName: "फेडिग्री (Fedigree)",
    tagline: "भारत के लिए पारिवारिक स्वास्थ्य वृक्ष और जीवनशैली रोग रोकथाम मंच",
    navHome: "होम",
    navTree: "फैमिली ट्री",
    navAssess: "स्वास्थ्य जांच",
    navReport: "डॉक्टर रिपोर्ट",
    navPredict: "ML डायबिटीज टेस्ट",
    navProfile: "स्वास्थ्य प्रोफ़ाइल",
    heroTitle: "पीढ़ी-दर-पीढ़ी होने वाले जीवनशैली रोगों को समय रहते पहचानें और रोकें",
    heroSubtitle: "3 पीढ़ियों का पारिवारिक इतिहास, ICMR प्रमाणित भारतीय मधुमेह जोखिम स्कोर (IDRS), ML मॉडल्स और महाराष्ट्र का रियल-टाइम प्रदूषण (AQI).",
    ctaStartTree: "फैमिली ट्री बनाएं",
    ctaFastScreen: "2-मिनट त्वरित जांच",
    badgeHackathon: "सेवा इनोवेशन चैलेंज 2026 • श्रेणी 4: गैर-संचारी रोग (NCDs)",
    feature1Title: "इंटरैक्टिव पारिवारिक वृक्ष",
    feature1Desc: "डायबिटीज, हार्ट अटैक और हाई बीपी के पारिवारिक पैटर्न को 3 पीढ़ियों में आसानी से देखें।",
    feature2Title: "ICMR प्रमाणित और AI/ML इंजन",
    feature2Desc: "डॉ. वी. मोहन और ICMR द्वारा प्रमाणित IDRS फॉर्मूला और LASI भारतीय जनसांख्यिकी मॉडल।",
    feature3Title: "1-पेज डॉक्टर ओपीडी सारांश",
    feature3Desc: "सरकारी अस्पताल (PHC) या निजी क्लिनिक में डॉक्टरों के लिए 2 मिनट में पढ़ने योग्य सारांश।",
    treeTitle: "पारिवारिक स्वास्थ्य वृक्ष (Family Canvas)",
    treeSubtitle: "परिवार के सदस्यों को जोड़ने या उनकी स्थिति देखने के लिए नोड पर क्लिक करें।",
    addRelative: "रिश्तेदार जोड़ें",
    selfNode: "स्वयं (Self)",
    father: "पिता (Father)",
    mother: "माता (Mother)",
    brother: "भाई (Brother)",
    sister: "बहन (Sister)",
    grandfather: "दादा / नाना (Grandfather)",
    grandmother: "दादी / नानी (Grandmother)",
    child: "बेटा / बेटी (Child)",
    conditions: "पहचानी गई बीमारियां",
    diabetes: "टाइप 2 डायबिटीज (मधुमेह)",
    hypertension: "हाई ब्लड प्रेशर (उच्च रक्तचाप)",
    heartDisease: "हृदय रोग / हार्ट अटैक (CAD)",
    stroke: "स्ट्रोक / लकवा",
    respiratory: "दमा / सांस की बीमारी (Asthma/COPD)",
    ageYears: "उम्र (वर्ष)",
    isAlive: "जीवित हैं",
    save: "ट्री में सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    close: "बंद करें",
    assessTitle: "गैर-आक्रामक (Non-Invasive) स्वास्थ्य जानकारी",
    assessSubtitle: "बिना सुई या खून की जांच के सिर्फ 2 मिनट में डायबिटीज और हृदय रोग का जोखिम जानें।",
    waistCircumference: "कमर का घेरा (सेमी में)",
    waistHelp: "भारतीय मानक: सामान्य <80 सेमी, मध्यम 80-89 सेमी, उच्च जोखिम ≥90 सेमी।",
    physicalActivity: "दैनिक शारीरिक गतिविधि / व्यायाम",
    vigorous: "कठिन परिश्रम / खेल (खेती, साइकिल चलाना, दौड़ना)",
    moderate: "मध्यम गतिविधि (30 मिनट तेज चलना, घरेलू कार्य)",
    sedentary: "बैठी जीवनशैली (दिनभर बैठकर काम करना)",
    tobaccoHabit: "क्या आप तंबाकू, बीड़ी, गुटखा या सिगरेट का सेवन करते हैं?",
    yes: "हाँ",
    no: "नहीं",
    selectDistrict: "महाराष्ट्र का अपना जिला चुनें",
    aqiImpact: "क्षेत्रीय वायु प्रदूषण प्रभाव (AQI)",
    calculateRisk: "कुल जोखिम की गणना करें",
    calculating: "गणना जारी है...",
    resultsTitle: "व्यक्तिगत स्वास्थ्य जोखिम मूल्यांकन",
    idrsScore: "भारतीय डायबिटीज जोखिम स्कोर (IDRS)",
    mlDiabetesScore: "LASI मशीन लर्निंग डायबिटीज मॉडल",
    mlCvdScore: "LASI हृदय रोग संयुक्त स्कोर",
    riskLow: "कम जोखिम (Low)",
    riskModerate: "मध्यम जोखिम (Moderate)",
    riskHigh: "उच्च जोखिम (High)",
    doctorTriageBrief: "1-पेज डॉक्टर परामर्श रिपोर्ट",
    downloadPdf: "डॉक्टर रिपोर्ट PDF डाउनलोड करें",
    dietAdviceTitle: "ICMR-NIN पोषण और जीवनशैली मार्गदर्शन",
    dietAdviceSub: "भारतीय खानपान के अनुसार मिलेट्स, तेल और नमक नियंत्रण की व्यावहारिक सलाह।",
    offlineNotice: "बिना इंटरनेट के भी यह जांच आपके फोन पर तुरंत काम करती है।"
  }
};
