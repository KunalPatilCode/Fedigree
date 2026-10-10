# Family Health Tree for NCD Risk Awareness and Preventive Care in India

## Problem

Family medical histories are often scattered across paper reports, hospitals, and individual memories. Families may overlook patterns across generations and miss opportunities for appropriate screening, genetic counseling, and preventive care. Family history alone also misses current health, lifestyle, environmental exposure, and barriers to accessing care.

## Proposed concept

An India-focused application that connects an interactive family health tree with lifelong medical records, current health information, lifestyle questionnaires, and environmental context. It helps families understand possible inherited and noncommunicable disease (NCD) risks and take informed steps through screening, clinician consultation, practical lifestyle goals, and follow-up.

The platform supports risk awareness and early detection. It does not guarantee which conditions a future child will inherit or promise that every genetic condition or NCD can be prevented.

## Information to collect

| Area | Information | Purpose |
| --- | --- | --- |
| Family history | Biological relationships, conditions, age at diagnosis, verified genetic reports when available | Identify patterns for clinical assessment or genetic counseling |
| Current health | Age, height, weight, waist circumference, blood pressure, conditions, medicines, available glucose and cholesterol results | Support condition-specific assessment and track changes |
| Lifestyle | Tobacco, alcohol, diet, activity, sedentary time, sleep | Support achievable behavior-change goals |
| Environment | Outdoor air pollution, household smoke, secondhand smoke, workplace exposure | Provide context and exposure-reduction education |
| Access and circumstances | Language, food affordability, healthcare access, safe exercise spaces, digital literacy | Make guidance realistic and accessible |
| Preventive care | Screening history, results, referrals, follow-up visits | Track recommended care and completion |

## Reuse existing government resources

Build the family-health experience around existing services, datasets, and guidance. Distinguish API integration from referral links and educational content: the existence of a public platform does not automatically grant access to its patient data.

| Need | Government resource | Proposed use | Access or limitation |
| --- | --- | --- | --- |
| Health records | Ayushman Bharat Digital Mission (ABDM) / ABHA | Pursue consent-based exchange of available records from participating providers | Requires the applicable integration, sandbox validation, security checks, and production access. ABHA alone does not provide a complete lifetime medical history. |
| NCD screening and follow-up | National NCD Programme / Portal | Align referrals and follow-up with existing screening pathways | Start with uploaded results and clinical partnerships. Direct patient-data integration requires confirmed authorization and technical access. |
| Nutrition education | ICMR–National Institute of Nutrition Dietary Guidelines for Indians | Develop Indian-context educational content and clinically reviewed guidance | A knowledge resource, not a patient-data API. Check reuse terms and maintain source attribution. |
| Outdoor air pollution | CPCB data published through data.gov.in | Use the published data API to provide location-based pollution information | Verify API registration, terms, coverage, update times, and missing-data handling. Station data is not a measurement of individual exposure. |

Government resources will not necessarily contain personal diet, exercise, sleep, smoking, alcohol use, household smoke, or workplace exposure. Retain a short user questionnaire for these gaps.

## What the application must build

- Interactive family tree with biological relationships and available medical histories.
- Individual consent and permission-controlled sharing; family membership must not automatically expose medical records.
- Report uploads and extraction, with user or clinician verification before clinical use.
- Short personal-health, lifestyle, and environmental questionnaires.
- Explainable, condition-specific assessments using validated tools suitable for the target population.
- Practical action plans, clinician referrals, screening reminders, and follow-up tracking.
- Regional-language explanations, initially English, Hindi, and Marathi.
- Clear handling of missing information, uncertainty, and outdated records.

## Clinical scope

NCDs arise from genetic, physiological, environmental, and behavioral factors. Family history is one input, not a complete explanation of risk. Assess individual conditions separately rather than inventing a single overall NCD risk percentage.

Keep pregnancy-related hereditary-risk assessment as a distinct module. Routine reports and family history can flag concerns, but some inherited-risk assessments require carrier screening or genetic testing and specialist interpretation. Lifestyle changes do not alter which genetic variants are inherited.

Distinguish future disease risk from an abnormal finding that needs medical review. Have qualified clinicians review assessment rules, recommendation content, and escalation pathways.

## MVP approach

1. Create family and individual profiles with consent settings.
2. Add family history and available medical reports manually.
3. Confirm extracted report information.
4. Complete a short lifestyle and exposure questionnaire.
5. Provide a limited set of clinically reviewed assessments, initially focused on adult diabetes and hypertension risk awareness and screening support.
6. Offer government-backed educational guidance, relevant pollution context, screening referrals, and a downloadable doctor summary.
7. Track completed screenings, referrals, and practical lifestyle goals.
8. Add approved health-record integrations when access and technical requirements are confirmed.

The MVP should remain usable when government integrations are unavailable. Use uploads and manual entry as fallbacks, and label their source and verification status.

## Innovation and validation

Family-tree and hereditary-risk tools already exist, including FamGenix. The proposed innovation is connecting verified family history, current health, lifestyle, environmental context, and existing Indian services into an understandable family prevention workflow.

Do not claim to be the first or unique without competitor research. Do not claim proven disease prevention before evaluation. Initial measures could include screening completion, referral completion, understanding of risk explanations, sustained behavior changes, and clinician assessment of safety and usefulness.

## Suggested positioning

> A family health platform that connects medical history across generations to support early NCD risk identification, timely screening, and personalized preventive care in India.

## Sources

Official resources checked during the concept discussion on 10 October 2026. Integration availability and requirements should be verified again before implementation.

- [WHO: Noncommunicable diseases](https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases)
- [WHO: Preventing noncommunicable diseases](https://www.who.int/activities/preventing-noncommunicable-diseases)
- [National NCD Portal](https://ncd.mohfw.gov.in/)
- [National NCD Programme overview](https://ncd.mohfw.gov.in/ncdlandingassets/aboutus.html)
- [Government explanation of ABDM consent and integration checks](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2152537&lang=2&reg=48)
- [ICMR–NIN dietary guidance resources](https://nin.res.in/popular.html)
- [Government open-data catalogue: Real-time air quality index](https://www.data.gov.in/catalog/real-time-air-quality-index)
- [CDC: Family health history and pregnancy](https://www.cdc.gov/family-health-history/family-health-history-and-you/family-health-history-and-pregnancy.html)
- [NHGRI: Genetic testing FAQ](https://www.genome.gov/FAQ/Genetic-Testing)
- [FamGenix features](https://famgenix.com/features/)

This document describes a proposed product. Government connections and clinical capabilities are planned features, not completed integrations or validated outcomes.
