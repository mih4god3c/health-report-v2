import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts'

// CONST DICTIONARY TO MAP FORM_ID
const FORM_ID_MAP = {
  "ZTi5SsvB": "e925ac5d-baa2-4131-883e-cb01d6d5ab6e"
}


// MOCK PAYLOAD
// const payload = {
//   "event_id": "01HVTPCK9Y7RMC70ZPGDPPVS6X",
//   "event_type": "form_response",
//   "form_response": {
//     "token": "62czypa0cq0xwxkp5lg62czdm3ydshj3",
//     "ending": {
//       "id": "ArFlb71irwmh",
//       "ref": "94ca21a5-ec42-4e01-bed9-28f2cb7ee7cc"
//     },
//     "hidden": {
//       "hubspot_utk": "ffb65fe9048e27c587bdecc540d5c205",
//       "hubspot_page_url": "https://arootah.typeform.com/to/ZTi5SsvB",
//       "hubspot_page_name": "Health Assessment 2024"
//     },
//     "answers": [
//       {
//         "type": "choice",
//         "field": {
//           "id": "w8cnosMPMUVc",
//           "ref": "af1671bf-9d9a-4f4e-a15d-5da890fa52a1",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "1Urm78jtQsQN",
//           "ref": "c6f67946-eec0-42df-801d-28e5308636a7",
//           "label": "0-25%"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "rgZ2WxbbbeZJ",
//           "ref": "1fca6d92-392f-4447-b02d-56f6d591522b",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "1UhokKRPrY8R",
//           "ref": "9cf33955-dcb7-4a31-9638-74be36c6f0ec",
//           "label": "0"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "cRXNEcwUoDrq",
//           "ref": "9a0f3234-cc57-42d9-ac18-69ae339d6f98",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "kUJ6MqsYiCTw",
//           "ref": "5618454e-3d49-44b6-a220-5c7098953bf4",
//           "label": "0 hours"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "GagGiDio9kSV",
//           "ref": "58ce470d-1cd4-440d-a18b-602c88f36afd",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "RyzxGbyKmNvA",
//           "ref": "db80cebf-ed11-40ba-ac99-bfe42294f0b0",
//           "label": "I consistently get 7-8 hours of restful sleep each night."
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "lTRgX96NDfIU",
//           "ref": "9de6930c-05cd-417c-b262-9e66ad9e4637",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "2trimLGZq2gj",
//           "ref": "4c71d952-f627-4694-aeef-61890b846a35",
//           "label": "There's some variation in my sleep schedule, but I generally know my usual sleep and wake times."
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "lRscu2oZjK2c",
//           "ref": "8f929886-e1fa-4294-86c9-0d9f8e67080e",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "OTqOjgKkHvNm",
//           "ref": "8fa6c93e-9ad8-4131-bbcd-6324e2c75ee7",
//           "label": "Yes, through a smartphone app without additional devices"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "2vcq4hm1oVRW",
//           "ref": "5d69001b-63ae-4e78-a193-c7c086ba1f86",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "KsvKIvryHWuF",
//           "ref": "8ff18d60-3a19-473d-b174-e64a6ffef246",
//           "label": "Exclusively whole foods"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "XKm2dwme2Gl4",
//           "ref": "aa286aa6-df92-4447-bb09-8d982d0201f8",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "6KS8qEzhjBAR",
//           "ref": "f16bb537-f391-4fed-afde-b5102674af55",
//           "label": "Once a month"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "lf66eh6PX7GX",
//           "ref": "e37b5cdc-b6e1-4f1d-b767-45bb7cde36e5",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "DrqB5sLRg5vB",
//           "ref": "bf965721-1634-49dd-87ea-2605660339e0",
//           "label": "Yes, I track macronutrients (proteins, fats, carbohydrates)"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "7WbR7mSY7zOG",
//           "ref": "622d2d2f-b15f-4711-a637-5a01c397fb5f",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "hTadPymJRH88",
//           "ref": "938ecbca-3618-4dd2-a601-cd8862ad7745",
//           "label": "No, I do not consult with any wellness professionals"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "YVJZAVKdYKVS",
//           "ref": "7f2eb02d-20ad-4f9e-90c2-daf24b655145",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "lxBFoK0Wz5bm",
//           "ref": "54f48d5e-bf9b-4e82-9644-a91aa0d61e7e",
//           "label": "Yes, I occasionally take supplements without specific guidance"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "FkWsYRK6IOdy",
//           "ref": "9e37c1f0-6e30-4054-b5da-f5e06c33dc88",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "QZzoC8wPGR2p",
//           "ref": "052efb7f-0c90-4689-ba28-4e921fb36c61",
//           "label": "Once a week"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "rGTUhbhurEVE",
//           "ref": "c4804024-a286-451d-8624-ce5d6e15b5c2",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "vBEtQGD4Bffg",
//           "ref": "cebf89cf-f6f2-4d0d-a805-3caafaafb7e1",
//           "label": "1-4 times a month"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "2mvrNmk7yNRy",
//           "ref": "85355366-fe60-4b5f-819c-5ba9854aef27",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "Z2R80NoDAW9z",
//           "ref": "cc958be8-909d-4575-9270-2fb692ba1ddb",
//           "label": "Poor - I experience discomfort due to my environment"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "IfT6YXnP6ttl",
//           "ref": "a3245378-1c13-49aa-a677-1f124cb9ce4e",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "zec5pCsIGP4d",
//           "ref": "3199b437-3ee2-425f-a8ad-f0d46be21bc3",
//           "label": "Never"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "1cEVrva6K19q",
//           "ref": "d4bc972c-664a-4065-af8e-9c4518f0e9b3",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "xR3VVREgCGAf",
//           "ref": "2991aca1-1f4b-42ca-8294-b9c6ace96a41",
//           "label": "1-3 hours"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "7TOB93PHLcax",
//           "ref": "0bbb382d-a963-4be7-ac64-7f7b87eed768",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "rHi7xkvYaNFo",
//           "ref": "780208cf-8b7c-4cf0-aa95-598ca8280e7c",
//           "label": "4-6 hours"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "ZVGowCdAgSli",
//           "ref": "ee8c2653-8403-4dd5-b0e3-9b9bf9f3c552",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "pGsiJO5hjQVR",
//           "ref": "312a6821-a85a-46d7-b9f7-84b5834565ee",
//           "label": "Yes, I am part of a fitness community or group that regularly meets for physical activities (e.g., running club, group fitness classes)"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "UtQYMiaUS7Nu",
//           "ref": "7bb5f30a-f721-4207-acad-f8929add23b7",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "giavLfxm39qv",
//           "ref": "6ef1e014-120d-4dc3-9a30-186cacdaf59c",
//           "label": "I do not take specific actions to counteract inactivity"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "XlSSST2DeEpR",
//           "ref": "db22a01d-380c-4350-a914-040b50550afe",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "gQBiDTSrkDKn",
//           "ref": "7fde6b25-398f-4712-a2cd-cdd404853a1d",
//           "label": "10,000 steps or more"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "FuLMvQzvW3CT",
//           "ref": "13f42c73-5d5f-4ff8-a08e-98dc8f28c31e",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "nbDdTrKko9sz",
//           "ref": "d815d3a3-d5e6-4f5b-b437-0bc766041627",
//           "label": "Yes, I occasionally check my weight and have assessed my body composition at least once"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "nq9PvZb4cR6o",
//           "ref": "004b257f-9b22-4adb-92f9-56055766c0a9",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "66aPlGaLD7b1",
//           "ref": "cbf3f052-66b4-4c53-93d2-8cbe05cdeb89",
//           "label": "I often make a conscious effort to eat mindfully, regardless of the meal size"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "OmXNhRHxEISn",
//           "ref": "46a21695-f329-4056-aa6b-1aa5c78521f9",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "RhcvwyzZ4DVz",
//           "ref": "30e933bf-6bf4-48d0-8f04-bf4012e51fba",
//           "label": "I primarily manage my diet without external guidance"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "RW3gcB5S9cp3",
//           "ref": "f2f5bdc8-73c9-4ca4-8758-f8d9f862101e",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "NYfisgQzzPCX",
//           "ref": "ed5f03fb-1537-48ca-9683-b908fa0a35e1",
//           "label": "Sometimes, but not always"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "DJUes9r7yEGd",
//           "ref": "d38122fb-117a-4980-b888-b2eeeaa4d980",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "U8wi5Hap2dLn",
//           "ref": "9fa8f7a2-2753-4b3f-bf18-d4ad2ca5c7f2",
//           "label": "Sometimes, but not always"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "NeLBcFe3LGGP",
//           "ref": "18e82855-27f9-4d6b-978d-e7cabda20efd",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "NFRAVryGfNQA",
//           "ref": "68c86e88-b82f-4b3f-b94f-0c59db009454",
//           "label": "I frequently drink heavily or exceed recommended limits"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "HJTg5IN2bDhf",
//           "ref": "56416b93-9c1d-4895-bd6d-efff342e5684",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "u0RKC9N5KRxl",
//           "ref": "824511eb-d7dc-42f7-901c-e56a0c84719d",
//           "label": "I have never used these products"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "84WpyN6xeYUT",
//           "ref": "726db968-bbb4-4adf-a7a8-dfcbc44830eb",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "fBxG5JPmg0o1",
//           "ref": "4fcccb5c-c0b7-4955-9c5b-45fab3a8d60b",
//           "label": "I occasionally consume processed foods and sugary products"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "EtFyUyduPIi3",
//           "ref": "17c7197a-afe3-4ac2-8706-ebcc76402f4a",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "oPUJrVTFaJWx",
//           "ref": "49b32022-11ce-4d3a-aa02-6b18f6889c87",
//           "label": "I rarely or never eat red meat"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "mb0YNF0RS0sM",
//           "ref": "9b084391-02b4-4c16-acaf-058d770d8ef4",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "ERXJ9BqzCMoV",
//           "ref": "1c4f5af1-1832-4a14-b0a9-67cf646686ac",
//           "label": "2 to 3 liters"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "eZ5adnZQG1FU",
//           "ref": "21ce98f9-e3b1-46b0-96c8-d293d92026f3",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "vxyYlXnBzZge",
//           "ref": "1839ccc1-545c-4a0f-9579-ee5cf1973099",
//           "label": "Rarely or never"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "idDPKxbTtbM1",
//           "ref": "969f25bf-c882-471c-b60b-8806c578e39f",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "b2jlQwFfAhau",
//           "ref": "f7610618-1777-4c22-b3b9-64ae1597fd73",
//           "label": "Sometimes, I choose non-toxic options when available"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "4wMR56l6Z7vo",
//           "ref": "7b69f9ca-4cc7-4116-b1b8-623a7b596bb8",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "WHNJIJaTBr5V",
//           "ref": "cf3ace1e-0753-4dea-b667-200b8f5f4edd",
//           "label": "I actively minimize my exposure by using advanced filtration systems and avoiding polluted areas when possible"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "FVexnADuNMRT",
//           "ref": "3c3dd390-96e5-410a-b50c-ed9123feb8c8",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "KTOOIJNqKAuz",
//           "ref": "5479c41a-7efe-41d5-88ec-7781c5e62273",
//           "label": "I consistently use positive stress as a catalyst for growth and achievement"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "k4JIcQA6BONo",
//           "ref": "3ac122b4-ad76-4003-9032-34feb7d8fc48",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "XaSWUAG3AdlY",
//           "ref": "38c90a06-801b-44c4-802b-792381a59dd5",
//           "label": "I have a set of reliable techniques that I regularly use to mitigate stress"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "6uECKeaC3r7b",
//           "ref": "82cd2287-1111-47b7-a5ea-ced1cb63ab37",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "pu2BxmoAuW0L",
//           "ref": "664ed4a3-98e2-4274-8081-614e5e54b7a3",
//           "label": "As an overwhelming force that frequently hinders my daily functioning"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "kKjZnVMIWnE4",
//           "ref": "4ce82dc1-5889-4eca-9235-d044557e880e",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "W1CC5L5dvJCd",
//           "ref": "fe94b59d-b5d2-4680-90a8-81a483cf520b",
//           "label": "I am aware of stress indicators but do not actively monitor them"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "UE1a1zoHSOJW",
//           "ref": "05e65856-4200-4ed1-ad81-94e09ef2f2fc",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "hVYQ5J1xIWz8",
//           "ref": "5ae0e126-ff8c-4f70-91ae-b628c7d53800",
//           "label": "Meditation or mindfulness is a regular part of my routine for managing stress"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "6p9YZfb4mCNL",
//           "ref": "c5e4ba56-2dbd-47c3-83ff-46637911763a",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "hQLQvxU6XAJ3",
//           "ref": "04e61c26-99a0-43c8-b4e5-3c8743767875",
//           "label": "I prioritize a balance, ensuring that relaxing or joyful activities are part of my daily life"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "FWDHeNRP77oe",
//           "ref": "ccf001d9-8220-4de9-b8f1-3fb971d70dc7",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "GKpadai5LdVg",
//           "ref": "ba1b9a89-e8e3-4eb3-9db3-f1fc476f32b0",
//           "label": "No, I do not monitor these indicators"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "YEQt8ic0LCyy",
//           "ref": "100bda0b-8093-45d5-850f-d53be08b390c",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "JjEgCAbZOHzL",
//           "ref": "eb5138f9-2ab7-4920-bab0-8aff6cf31678",
//           "label": "I engage in some of these practices occasionally"
//         }
//       },
//       {
//         "type": "choice",
//         "field": {
//           "id": "UDl1rtZaNBKK",
//           "ref": "66861779-7318-4e4b-8c6c-56135033552d",
//           "type": "multiple_choice"
//         },
//         "choice": {
//           "id": "Y3AThxBOq98b",
//           "ref": "6a9e74cd-37e9-49c6-afd5-dad736969ed3",
//           "label": "Weekly"
//         }
//       },
//       {
//         "text": "Miha",
//         "type": "text",
//         "field": {
//           "id": "MYUu4erMIcJ2",
//           "ref": "bc93f552-4f26-4af9-912c-45ec9c3cec94",
//           "type": "short_text"
//         }
//       },
//       {
//         "type": "email",
//         "email": "miha.godec22@gmail.com",
//         "field": {
//           "id": "wgw4G25aeb7k",
//           "ref": "f18d5d01-68a8-42bd-a2d2-01f3b44a5b65",
//           "type": "email"
//         }
//       }
//     ],
//     "form_id": "ZTi5SsvB",
//     "outcome": {
//       "id": "uA4g7DbRZRMB",
//       "title": "Total-Health Score: {{var:total_weighted_avg}}%"
//     },
//     "landed_at": "2024-04-19T08:06:31Z",
//     "variables": [
//       {
//         "key": "counter_243a6ff4_aec7_4a9f_9532_d04aed75e593",
//         "type": "number",
//         "number": 0
//       },
//       {
//         "key": "detox_max",
//         "type": "number",
//         "number": 39
//       },
//       {
//         "key": "detox_weighted_avg",
//         "type": "number",
//         "number": 0.03
//       },
//       {
//         "key": "detoxification_score",
//         "type": "number",
//         "number": 20
//       },
//       {
//         "key": "exercise_max",
//         "type": "number",
//         "number": 60
//       },
//       {
//         "key": "exercise_score",
//         "type": "number",
//         "number": 23
//       },
//       {
//         "key": "exercise_weighted_avg",
//         "type": "number",
//         "number": 0.06
//       },
//       {
//         "key": "longevity_max",
//         "type": "number",
//         "number": 42
//       },
//       {
//         "key": "longevity_score",
//         "type": "number",
//         "number": 13
//       },
//       {
//         "key": "longevity_weighted_avg",
//         "type": "number",
//         "number": 0.03
//       },
//       {
//         "key": "nutrition_max",
//         "type": "number",
//         "number": 45
//       },
//       {
//         "key": "nutrition_weighted_avg",
//         "type": "number",
//         "number": 0.1
//       },
//       {
//         "key": "nutriton_score",
//         "type": "number",
//         "number": 30
//       },
//       {
//         "key": "perils_max",
//         "type": "number",
//         "number": 67
//       },
//       {
//         "key": "perils_score",
//         "type": "number",
//         "number": 37
//       },
//       {
//         "key": "perils_weighted_avg",
//         "type": "number",
//         "number": 0.06
//       },
//       {
//         "key": "prevention_max",
//         "type": "number",
//         "number": 36
//       },
//       {
//         "key": "prevention_score",
//         "type": "number",
//         "number": 0
//       },
//       {
//         "key": "prevention_weighted_avg",
//         "type": "number",
//         "number": 0
//       },
//       {
//         "key": "rubric",
//         "text": "Moderate Health: You're on the right track, but there's room for improvement; let's focus on elevating your health to the next level.",
//         "type": "text"
//       },
//       {
//         "key": "score",
//         "type": "number",
//         "number": 0
//       },
//       {
//         "key": "sleep_max",
//         "type": "number",
//         "number": 41
//       },
//       {
//         "key": "sleep_score",
//         "type": "number",
//         "number": 30
//       },
//       {
//         "key": "sleep_weighted_avg",
//         "type": "number",
//         "number": 0.07
//       },
//       {
//         "key": "stress_max",
//         "type": "number",
//         "number": 63
//       },
//       {
//         "key": "stress_score",
//         "type": "number",
//         "number": 39
//       },
//       {
//         "key": "stress_weighted_avg",
//         "type": "number",
//         "number": 0.03
//       },
//       {
//         "key": "structure_max",
//         "type": "number",
//         "number": 39
//       },
//       {
//         "key": "structure_score",
//         "type": "number",
//         "number": 22
//       },
//       {
//         "key": "structure_weighted_avg",
//         "type": "number",
//         "number": 0.06
//       },
//       {
//         "key": "total_weighted_avg",
//         "type": "number",
//         "number": 47.09
//       },
//       {
//         "key": "weight_management_score",
//         "type": "number",
//         "number": 16
//       },
//       {
//         "key": "weight_max",
//         "type": "number",
//         "number": 39
//       },
//       {
//         "key": "weight_weighted_avg",
//         "type": "number",
//         "number": 0.04
//       },
//       {
//         "key": "winning_outcome_id",
//         "type": "outcome_id",
//         "outcome_id": "uA4g7DbRZRMB"
//       }
//     ],
//     "calculated": {
//       "score": 0
//     },
//     "definition": {
//       "id": "ZTi5SsvB",
//       "title": "Health Assessment 2024",
//       "fields": [
//         {
//           "id": "w8cnosMPMUVc",
//           "ref": "af1671bf-9d9a-4f4e-a15d-5da890fa52a1",
//           "type": "multiple_choice",
//           "title": "Approximately what percentage of the top 10 causes of death are preventable?",
//           "choices": [
//             {
//               "id": "1Urm78jtQsQN",
//               "ref": "c6f67946-eec0-42df-801d-28e5308636a7",
//               "label": "0-25%"
//             },
//             {
//               "id": "lC05BNQejxV0",
//               "ref": "67f79da3-b51f-42df-af10-6e7ca101e81e",
//               "label": "26-50%"
//             },
//             {
//               "id": "mNoUXP3QdcXF",
//               "ref": "86fb652f-746a-4bbc-9c62-311e439aca3a",
//               "label": "51-75%"
//             },
//             {
//               "id": "1hB6leqMKSgQ",
//               "ref": "38c1a1a2-2e6b-4c3e-b333-a1e6815a3f58",
//               "label": "76-100%"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "rgZ2WxbbbeZJ",
//           "ref": "1fca6d92-392f-4447-b02d-56f6d591522b",
//           "type": "multiple_choice",
//           "title": "How many health screenings do you participate in annually?",
//           "choices": [
//             {
//               "id": "1UhokKRPrY8R",
//               "ref": "9cf33955-dcb7-4a31-9638-74be36c6f0ec",
//               "label": "0"
//             },
//             {
//               "id": "eMA5VOg5icAA",
//               "ref": "b5a3535e-b66a-484a-be21-45b18f1524e5",
//               "label": "1-2"
//             },
//             {
//               "id": "herMXXrdVNjX",
//               "ref": "ce61da61-8f60-46ae-b074-ec06d0f15df1",
//               "label": "3-4"
//             },
//             {
//               "id": "4PdTCXDzpcOm",
//               "ref": "5eb08ca2-ea59-4bb8-a1b5-3b6181090d97",
//               "label": "5 or more"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "cRXNEcwUoDrq",
//           "ref": "9a0f3234-cc57-42d9-ac18-69ae339d6f98",
//           "type": "multiple_choice",
//           "title": "How many hours do you spend per week educating yourself on health topics (books, podcasts, etc)?",
//           "choices": [
//             {
//               "id": "kUJ6MqsYiCTw",
//               "ref": "5618454e-3d49-44b6-a220-5c7098953bf4",
//               "label": "0 hours"
//             },
//             {
//               "id": "5dbYkcVgtKfH",
//               "ref": "7af20f83-49c5-4e9e-9d9f-c916145d2888",
//               "label": "1-3 hours"
//             },
//             {
//               "id": "lCVFIAjlCroX",
//               "ref": "3093ca48-8c2a-4e2d-813c-ed5facaba5be",
//               "label": "4-6 hours"
//             },
//             {
//               "id": "DnHl2WMp86Bd",
//               "ref": "5295afea-124f-494e-a0d4-226c87f50ee4",
//               "label": "7 hours or more"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "GagGiDio9kSV",
//           "ref": "58ce470d-1cd4-440d-a18b-602c88f36afd",
//           "type": "multiple_choice",
//           "title": "How many hours of sleep do you get per night?",
//           "choices": [
//             {
//               "id": "RyzxGbyKmNvA",
//               "ref": "db80cebf-ed11-40ba-ac99-bfe42294f0b0",
//               "label": "I consistently get 7-8 hours of restful sleep each night."
//             },
//             {
//               "id": "KrZ6KoG6QvBa",
//               "ref": "2f730c2a-c535-4d7f-a723-8ed6f4badf7d",
//               "label": "I achieve 6-7 hours of sleep most nights, with occasional restlessness."
//             },
//             {
//               "id": "1pCMvsjsgRpr",
//               "ref": "1f6968f3-9aad-4456-8a2b-6c302d800074",
//               "label": "My sleep varies, often getting less than 6 hours or experiencing poor quality."
//             },
//             {
//               "id": "bw3fODLIZlVD",
//               "ref": "1dad2394-657f-4325-bd67-b21d6af0704a",
//               "label": "I frequently have disrupted sleep or sleep less than 5 hours."
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "lTRgX96NDfIU",
//           "ref": "9de6930c-05cd-417c-b262-9e66ad9e4637",
//           "type": "multiple_choice",
//           "title": "How consistent are your wake-up and bedtime routines throughout the week?",
//           "choices": [
//             {
//               "id": "9pm8uO1Ye75A",
//               "ref": "21a2b71b-91ac-4cbd-8cac-7f701d283479",
//               "label": "My routines vary widely; it's hard to predict when I'll sleep or wake up."
//             },
//             {
//               "id": "2trimLGZq2gj",
//               "ref": "4c71d952-f627-4694-aeef-61890b846a35",
//               "label": "There's some variation in my sleep schedule, but I generally know my usual sleep and wake times."
//             },
//             {
//               "id": "xeXsiR9PcQDQ",
//               "ref": "605fc420-0b77-409f-bcb2-a52bdb92900e",
//               "label": "I maintain a steady sleep schedule, with occasional deviations on weekends or special occasions."
//             },
//             {
//               "id": "0lrUifhlaRDq",
//               "ref": "f309311e-102f-4414-82d4-93dec54ae206",
//               "label": "I adhere strictly to my sleep and wake times daily, making little to no exceptions."
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "lRscu2oZjK2c",
//           "ref": "8f929886-e1fa-4294-86c9-0d9f8e67080e",
//           "type": "multiple_choice",
//           "title": "Do you measure the quality of your sleep with a device?",
//           "choices": [
//             {
//               "id": "dunSmjSSK2YG",
//               "ref": "6338d01e-968b-4dd6-b663-ed48be315d5a",
//               "label": "I do not monitor my sleep quality"
//             },
//             {
//               "id": "70yIcVd9v90z",
//               "ref": "76751c09-bfe4-4323-ba54-b3aca2450a25",
//               "label": "I regularly note or observe my sleep patterns without technology (e.g., journaling, noting how I feel upon waking)"
//             },
//             {
//               "id": "OTqOjgKkHvNm",
//               "ref": "8fa6c93e-9ad8-4131-bbcd-6324e2c75ee7",
//               "label": "Yes, through a smartphone app without additional devices"
//             },
//             {
//               "id": "In3Z8VfTgtnS",
//               "ref": "a01de315-7c06-4785-84f4-24ce82ea0b7b",
//               "label": "Yes, using a wearable device (e.g., Oura Ring, Whoop)"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "2vcq4hm1oVRW",
//           "ref": "5d69001b-63ae-4e78-a193-c7c086ba1f86",
//           "type": "multiple_choice",
//           "title": "Which best describes the majority of food you stock at home?",
//           "choices": [
//             {
//               "id": "i4HZyEc6QWIA",
//               "ref": "42112add-99a0-414c-af09-c4fb55c2e5dd",
//               "label": "Mostly processed foods"
//             },
//             {
//               "id": "zPJ43kepi7ei",
//               "ref": "ec0dd2d5-fd8f-4a44-ae65-1a0771b03e8b",
//               "label": "A mix of processed and whole foods"
//             },
//             {
//               "id": "Wqg7Tl6fsdF8",
//               "ref": "df991020-3aa3-450b-8140-4e0964c23e2c",
//               "label": "Mostly whole foods (fruits, vegetables, grains, meats)"
//             },
//             {
//               "id": "KsvKIvryHWuF",
//               "ref": "8ff18d60-3a19-473d-b174-e64a6ffef246",
//               "label": "Exclusively whole foods"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "XKm2dwme2Gl4",
//           "ref": "aa286aa6-df92-4447-bb09-8d982d0201f8",
//           "type": "multiple_choice",
//           "title": "How frequently do you consume meals prepared outside your home, including restaurants and takeout?",
//           "choices": [
//             {
//               "id": "hu36p1vfuo5i",
//               "ref": "36dbab25-c401-460d-be9a-502439751277",
//               "label": "Rarely or never"
//             },
//             {
//               "id": "6KS8qEzhjBAR",
//               "ref": "f16bb537-f391-4fed-afde-b5102674af55",
//               "label": "Once a month"
//             },
//             {
//               "id": "SmyzxAS0KgV4",
//               "ref": "95e0ce73-b040-4d80-ac03-f0c9dbd84ad5",
//               "label": "Once a week"
//             },
//             {
//               "id": "yM2udfxDafcq",
//               "ref": "12b20f85-a836-4376-9274-a42fc2334fbe",
//               "label": "Multiple times a week"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "lf66eh6PX7GX",
//           "ref": "e37b5cdc-b6e1-4f1d-b767-45bb7cde36e5",
//           "type": "multiple_choice",
//           "title": "Do you follow a specific method to track or ensure you're meeting your nutritional needs (e.g., dietary guidelines, macronutrient tracking)?",
//           "choices": [
//             {
//               "id": "FhfCTATK9lqh",
//               "ref": "ebef4403-ec49-4851-b1d8-3f7bf8f12d66",
//               "label": "No, I do not track my nutritional intake"
//             },
//             {
//               "id": "HMEMExg90t32",
//               "ref": "2636575c-849c-4e6e-ad82-389e037fed06",
//               "label": "Yes, I follow general dietary guidelines"
//             },
//             {
//               "id": "DrqB5sLRg5vB",
//               "ref": "bf965721-1634-49dd-87ea-2605660339e0",
//               "label": "Yes, I track macronutrients (proteins, fats, carbohydrates)"
//             },
//             {
//               "id": "FQRzflq3EMe3",
//               "ref": "13700921-69f2-4a45-a509-2e529de82aa6",
//               "label": "Yes, I track both macronutrients and micronutrients (vitamins, minerals)"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "7WbR7mSY7zOG",
//           "ref": "622d2d2f-b15f-4711-a637-5a01c397fb5f",
//           "type": "multiple_choice",
//           "title": "Do you consult with a health coach or nutritionist for your dietary and wellness goals?",
//           "choices": [
//             {
//               "id": "hTadPymJRH88",
//               "ref": "938ecbca-3618-4dd2-a601-cd8862ad7745",
//               "label": "No, I do not consult with any wellness professionals"
//             },
//             {
//               "id": "3ayfvsoKFbo7",
//               "ref": "c36e67ba-dcbb-472c-8bec-490a3b7adffd",
//               "label": "Yes, I have consulted with a health coach or nutritionist in the past"
//             },
//             {
//               "id": "jU1kV4i3ehB0",
//               "ref": "3899a185-dd55-41ec-be82-25f30c53832a",
//               "label": "Yes, I occasionally consult with a health coach or nutritionist"
//             },
//             {
//               "id": "dsxPjzkiiAK2",
//               "ref": "f9723775-85e0-4024-8bf9-cb8417a1d1ac",
//               "label": "Yes, I regularly work with a health coach or nutritionist"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "YVJZAVKdYKVS",
//           "ref": "7f2eb02d-20ad-4f9e-90c2-daf24b655145",
//           "type": "multiple_choice",
//           "title": "How do you approach supplementing your diet with vitamins or minerals?",
//           "choices": [
//             {
//               "id": "rRvYVO86KJpX",
//               "ref": "c3dc5648-f3bd-4515-83c5-98ae6b17fa08",
//               "label": "I do not use dietary supplements"
//             },
//             {
//               "id": "lxBFoK0Wz5bm",
//               "ref": "54f48d5e-bf9b-4e82-9644-a91aa0d61e7e",
//               "label": "Yes, I occasionally take supplements without specific guidance"
//             },
//             {
//               "id": "9pNsg64YMvV8",
//               "ref": "413f4851-ef75-43f7-aa58-5021176c5eac",
//               "label": "Yes, I take supplements daily based on general advice"
//             },
//             {
//               "id": "1CkUth4WRrrH",
//               "ref": "441dc019-e33e-4e07-9407-a7f83c6ba85c",
//               "label": "Yes, I use supplements under the guidance of a healthcare professional"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "FkWsYRK6IOdy",
//           "ref": "9e37c1f0-6e30-4054-b5da-f5e06c33dc88",
//           "type": "multiple_choice",
//           "title": "Do you engage in yoga, Pilates, or similar practices for body alignment and flexibility?",
//           "choices": [
//             {
//               "id": "FUYmBdnsRJQd",
//               "ref": "10915687-2abd-4f64-a5dc-dd9e57279a85",
//               "label": "Never"
//             },
//             {
//               "id": "MqornLZFhpsR",
//               "ref": "53c29bc7-2c2e-400f-8dc1-ac51493af121",
//               "label": "1-3 times a month"
//             },
//             {
//               "id": "QZzoC8wPGR2p",
//               "ref": "052efb7f-0c90-4689-ba28-4e921fb36c61",
//               "label": "Once a week"
//             },
//             {
//               "id": "xI4pNmgWGVjM",
//               "ref": "08176a9e-eaf3-4520-8985-db8afdb22c3a",
//               "label": "2 or more times a week"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "rGTUhbhurEVE",
//           "ref": "c4804024-a286-451d-8624-ce5d6e15b5c2",
//           "type": "multiple_choice",
//           "title": "How often do you receive massages or physical therapy?",
//           "choices": [
//             {
//               "id": "L4twSkRQDe2R",
//               "ref": "5ea1860d-b3af-481b-a56f-c9e7c33e6a96",
//               "label": "Never"
//             },
//             {
//               "id": "nlxYFRqQyt7e",
//               "ref": "71a0c305-595d-4c3a-950f-06c6016a5416",
//               "label": "1-3 times a year"
//             },
//             {
//               "id": "3lFYnynxb4LU",
//               "ref": "cf9b47b1-82e8-4d92-9b8d-4222a828b4ed",
//               "label": "Every 2-6 months"
//             },
//             {
//               "id": "vBEtQGD4Bffg",
//               "ref": "cebf89cf-f6f2-4d0d-a805-3caafaafb7e1",
//               "label": "1-4 times a month"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "2mvrNmk7yNRy",
//           "ref": "85355366-fe60-4b5f-819c-5ba9854aef27",
//           "type": "multiple_choice",
//           "title": "How would you rate the ergonomics of your daily environments (including work and home)?",
//           "choices": [
//             {
//               "id": "Z2R80NoDAW9z",
//               "ref": "cc958be8-909d-4575-9270-2fb692ba1ddb",
//               "label": "Poor - I experience discomfort due to my environment"
//             },
//             {
//               "id": "o9HVtppVyr9r",
//               "ref": "ee7c6996-adf6-4fff-adb6-ddd6d088bce9",
//               "label": "Fair - My setup has minor ergonomic adjustments"
//             },
//             {
//               "id": "aMA19ig0t7tV",
//               "ref": "f5d11b7f-fd53-4caa-be16-50cd86ef3a06",
//               "label": "Good - My environment is mostly ergonomic but could be improved"
//             },
//             {
//               "id": "4agovACqU0WX",
//               "ref": "4992bb01-6fd8-4545-ac44-f50d0bd1af42",
//               "label": "Excellent - My daily environments are fully optimized for ergonomics"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "IfT6YXnP6ttl",
//           "ref": "a3245378-1c13-49aa-a677-1f124cb9ce4e",
//           "type": "multiple_choice",
//           "title": "How frequently do you practice posture-correcting exercises or mindfulness?",
//           "choices": [
//             {
//               "id": "zec5pCsIGP4d",
//               "ref": "3199b437-3ee2-425f-a8ad-f0d46be21bc3",
//               "label": "Never"
//             },
//             {
//               "id": "WLeuOHrvZKKx",
//               "ref": "acae3697-58c4-48c5-9066-04046615e727",
//               "label": "Occasionally (a few times a month)"
//             },
//             {
//               "id": "HEVIRqmYAxtb",
//               "ref": "4e4a5a87-1f32-4e43-a2fd-99a35301783a",
//               "label": "Regularly (once a week)"
//             },
//             {
//               "id": "xANYL5FRnOyY",
//               "ref": "7447ea71-0b84-45ed-b5cb-54f5775e0178",
//               "label": "Daily"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "1cEVrva6K19q",
//           "ref": "d4bc972c-664a-4065-af8e-9c4518f0e9b3",
//           "type": "multiple_choice",
//           "title": "On average, how many hours of aerobic exercise (such as walking, running, cycling) do you engage in per week?",
//           "choices": [
//             {
//               "id": "n4mU47wsas8n",
//               "ref": "5c299bf3-8834-471e-93e3-0cf079d8880e",
//               "label": "Less than 1 hour"
//             },
//             {
//               "id": "xR3VVREgCGAf",
//               "ref": "2991aca1-1f4b-42ca-8294-b9c6ace96a41",
//               "label": "1-3 hours"
//             },
//             {
//               "id": "EJN8boX7wm5f",
//               "ref": "5d0a0a2a-e03d-42b8-b03d-38b1bfaa57ef",
//               "label": "4-6 hours"
//             },
//             {
//               "id": "2bxlVqdSuJWW",
//               "ref": "0dc470ca-a5e0-4690-9270-c21c1d53364a",
//               "label": "7 hours or more"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "7TOB93PHLcax",
//           "ref": "0bbb382d-a963-4be7-ac64-7f7b87eed768",
//           "type": "multiple_choice",
//           "title": "On average, how many hours of anaerobic exercise (such as weightlifting, sprinting) do you perform per week?",
//           "choices": [
//             {
//               "id": "LwsURAt7C3t6",
//               "ref": "3b0d59df-3178-4ac6-80d9-ca0816bc1f83",
//               "label": "Less than 1 hour"
//             },
//             {
//               "id": "G4wXFMRKdXjr",
//               "ref": "473b01e5-3530-4cb3-881b-5cbf50a45899",
//               "label": "1-3 hours"
//             },
//             {
//               "id": "rHi7xkvYaNFo",
//               "ref": "780208cf-8b7c-4cf0-aa95-598ca8280e7c",
//               "label": "4-6 hours"
//             },
//             {
//               "id": "I0vbuewzF4LW",
//               "ref": "f7dd14a4-fb4c-4a02-8780-f17da84cca98",
//               "label": "7 hours or more"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "ZVGowCdAgSli",
//           "ref": "ee8c2653-8403-4dd5-b0e3-9b9bf9f3c552",
//           "type": "multiple_choice",
//           "title": "Do you engage with a personal trainer or follow a structured exercise program to guide your fitness activities?",
//           "choices": [
//             {
//               "id": "l9vdhWfaCGAL",
//               "ref": "4f5b89e0-8761-412c-a6c8-0590a3619c51",
//               "label": "No, I exercise independently without specific guidance"
//             },
//             {
//               "id": "nTd9wIPmKRD3",
//               "ref": "e1190ea5-5475-4c52-9069-5b562f58bbcb",
//               "label": "Yes, I occasionally consult a trainer or use a program"
//             },
//             {
//               "id": "GxbSXLpxryie",
//               "ref": "cf00a3c6-fc65-4ac9-8efc-1648da5cfb8d",
//               "label": "Yes, I regularly work with a trainer or adhere to a program"
//             },
//             {
//               "id": "pGsiJO5hjQVR",
//               "ref": "312a6821-a85a-46d7-b9f7-84b5834565ee",
//               "label": "Yes, I am part of a fitness community or group that regularly meets for physical activities (e.g., running club, group fitness classes)"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "UtQYMiaUS7Nu",
//           "ref": "7bb5f30a-f721-4207-acad-f8929add23b7",
//           "type": "multiple_choice",
//           "title": "How do you mitigate periods of inactivity (e.g., sedentary job, long hours sitting)?",
//           "choices": [
//             {
//               "id": "giavLfxm39qv",
//               "ref": "6ef1e014-120d-4dc3-9a30-186cacdaf59c",
//               "label": "I do not take specific actions to counteract inactivity"
//             },
//             {
//               "id": "MfVd1nOIep1L",
//               "ref": "3f4ffd6c-99c0-4c0d-b161-c8e82dec0743",
//               "label": "I occasionally stand, stretch, or walk briefly"
//             },
//             {
//               "id": "NNhD5UsfQxoV",
//               "ref": "60cf6c72-9687-4c03-a0d0-9f8c1afded63",
//               "label": "I make a concerted effort to stand, stretch, or walk at least once an hour"
//             },
//             {
//               "id": "KNBiJwx6z9c3",
//               "ref": "fef50d0d-aca0-4397-8334-e8829fafef1e",
//               "label": "I regularly incorporate activities like standing desks, frequent breaks for movement, or exercises specifically to counteract sedentary periods"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "XlSSST2DeEpR",
//           "ref": "db22a01d-380c-4350-a914-040b50550afe",
//           "type": "multiple_choice",
//           "title": "How many steps do you average per day?",
//           "choices": [
//             {
//               "id": "u5TJ59GHw6nE",
//               "ref": "bc43e610-9c7b-463a-b87a-3f3a35bc6169",
//               "label": "Less than 5,000 steps"
//             },
//             {
//               "id": "7anlfzAJpo8t",
//               "ref": "c243a997-b101-4660-9526-0e88fb6eb76c",
//               "label": "5,000 - 7,499 steps"
//             },
//             {
//               "id": "DKKaovjvBFC2",
//               "ref": "0c50543c-6a4a-48bb-a1c1-aa6bb14ff03f",
//               "label": "7,500 - 9,999 steps"
//             },
//             {
//               "id": "gQBiDTSrkDKn",
//               "ref": "7fde6b25-398f-4712-a2cd-cdd404853a1d",
//               "label": "10,000 steps or more"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "FuLMvQzvW3CT",
//           "ref": "13f42c73-5d5f-4ff8-a08e-98dc8f28c31e",
//           "type": "multiple_choice",
//           "title": "How regularly do you monitor your weight and body composition (e.g., body fat percentage)?",
//           "choices": [
//             {
//               "id": "wLq33AATqPID",
//               "ref": "3b03cd48-c448-4ba7-b168-b94ea5df2130",
//               "label": "No, I do not track my weight or body composition"
//             },
//             {
//               "id": "nbDdTrKko9sz",
//               "ref": "d815d3a3-d5e6-4f5b-b437-0bc766041627",
//               "label": "Yes, I occasionally check my weight and have assessed my body composition at least once"
//             },
//             {
//               "id": "CBBDIaB3TCKu",
//               "ref": "91031f37-f57b-426a-8594-56222e298d33",
//               "label": "Yes, I monitor my weight monthly and am aware of my body composition changes over time"
//             },
//             {
//               "id": "zeFPZZRBxk3C",
//               "ref": "8959a8b0-5ae8-4d03-89d9-bc8f9352fadc",
//               "label": "Yes, I track my weight and body composition (body fat percentage) regularly (weekly or more frequently)"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "nq9PvZb4cR6o",
//           "ref": "004b257f-9b22-4adb-92f9-56055766c0a9",
//           "type": "multiple_choice",
//           "title": "How do you describe your approach to mindful eating?",
//           "choices": [
//             {
//               "id": "xXxtxbQBJuSe",
//               "ref": "0e873bcd-42d8-43ff-b23d-d46b2fe5fd41",
//               "label": "I haven't practiced or am not familiar with mindful eating"
//             },
//             {
//               "id": "HK9XLBkyZLt0",
//               "ref": "a45a1612-ef61-41bb-a99a-0fabefd28087",
//               "label": "I occasionally practice mindful eating, especially during larger meals"
//             },
//             {
//               "id": "66aPlGaLD7b1",
//               "ref": "cbf3f052-66b4-4c53-93d2-8cbe05cdeb89",
//               "label": "I often make a conscious effort to eat mindfully, regardless of the meal size"
//             },
//             {
//               "id": "wYzcesVBGsRN",
//               "ref": "b59e1f5f-54f0-447d-8fd3-4d0681b99747",
//               "label": "Mindful eating is a consistent part of every meal"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "OmXNhRHxEISn",
//           "ref": "46a21695-f329-4056-aa6b-1aa5c78521f9",
//           "type": "multiple_choice",
//           "title": "How engaged are you with nutritional guidance for weight management?",
//           "choices": [
//             {
//               "id": "RhcvwyzZ4DVz",
//               "ref": "30e933bf-6bf4-48d0-8f04-bf4012e51fba",
//               "label": "I primarily manage my diet without external guidance"
//             },
//             {
//               "id": "C3sXnLVXpSI2",
//               "ref": "7bd0edf4-ca41-46ef-ada0-74592d933257",
//               "label": "I occasionally seek advice from reputable sources or professionals"
//             },
//             {
//               "id": "vjFmY5nSo8io",
//               "ref": "1c373744-f0cf-4433-81f7-905350b1b10a",
//               "label": "I actively participate in a structured weight management program or group"
//             },
//             {
//               "id": "v0En60SKj4iu",
//               "ref": "621f4aaa-57aa-478a-8c5a-cc87cb2c2f20",
//               "label": "I regularly consult with a nutritionist, dietitian, or similar professional"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "RW3gcB5S9cp3",
//           "ref": "f2f5bdc8-73c9-4ca4-8758-f8d9f862101e",
//           "type": "multiple_choice",
//           "title": "How frequently do you use seat belts when in a vehicle?\n",
//           "choices": [
//             {
//               "id": "vidNX72kl7in",
//               "ref": "d4d30fd5-85f4-4a82-8d18-e243ca9ea535",
//               "label": "Never"
//             },
//             {
//               "id": "NYfisgQzzPCX",
//               "ref": "ed5f03fb-1537-48ca-9683-b908fa0a35e1",
//               "label": "Sometimes, but not always"
//             },
//             {
//               "id": "TSQTc5Ctp5ig",
//               "ref": "7a96f261-e8f3-41a4-8331-816621bb0449",
//               "label": "Most of the time, with rare exceptions"
//             },
//             {
//               "id": "RNVCKThYv31j",
//               "ref": "0028b102-5997-48b2-bcc2-4d2f33de6be4",
//               "label": "Always, without exception"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "DJUes9r7yEGd",
//           "ref": "d38122fb-117a-4980-b888-b2eeeaa4d980",
//           "type": "multiple_choice",
//           "title": "If applicable, how often do you wear a helmet when cycling, motorbiking, or engaging in other activities requiring head protection?",
//           "choices": [
//             {
//               "id": "LyIxi2Yz49TU",
//               "ref": "46ca8275-795e-43d7-a01d-3ee7046535e0",
//               "label": "I do not participate in activities that require a helmet"
//             },
//             {
//               "id": "V1RQ5vbwC2wa",
//               "ref": "6358772e-e5e9-420e-8bed-20b63d936c6b",
//               "label": "Rarely or never when participating in these activities"
//             },
//             {
//               "id": "U8wi5Hap2dLn",
//               "ref": "9fa8f7a2-2753-4b3f-bf18-d4ad2ca5c7f2",
//               "label": "Sometimes, but not always"
//             },
//             {
//               "id": "EhchDKfLFrVW",
//               "ref": "6e6c70b0-74af-4689-ab48-887f7f7db0d5",
//               "label": "Always, without exception"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "NeLBcFe3LGGP",
//           "ref": "18e82855-27f9-4d6b-978d-e7cabda20efd",
//           "type": "multiple_choice",
//           "title": "How do you manage your consumption of alcohol?",
//           "choices": [
//             {
//               "id": "1MTRzwF6saF5",
//               "ref": "572549e8-8bee-4a91-ba42-0552d0e4c2a2",
//               "label": "I do not drink alcohol"
//             },
//             {
//               "id": "RmFHaajlKKZC",
//               "ref": "fe9dd5f6-3b3a-47a9-bbe0-9e5b69cd39c8",
//               "label": "I drink, but moderately and within recommended limits"
//             },
//             {
//               "id": "tZHR6t4kR9vg",
//               "ref": "f4f4c39c-8a53-4d1d-aaef-f82e4a3aa1ba",
//               "label": "I occasionally exceed recommended drinking limits"
//             },
//             {
//               "id": "NFRAVryGfNQA",
//               "ref": "68c86e88-b82f-4b3f-b94f-0c59db009454",
//               "label": "I frequently drink heavily or exceed recommended limits"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "HJTg5IN2bDhf",
//           "ref": "56416b93-9c1d-4895-bd6d-efff342e5684",
//           "type": "multiple_choice",
//           "title": "How do you approach the use of tobacco/nicotine products? ",
//           "choices": [
//             {
//               "id": "u0RKC9N5KRxl",
//               "ref": "824511eb-d7dc-42f7-901c-e56a0c84719d",
//               "label": "I have never used these products"
//             },
//             {
//               "id": "e2YONWjZYFuD",
//               "ref": "9c8d9414-09df-4420-b575-abd76b1a3ee9",
//               "label": "I have quit using these products"
//             },
//             {
//               "id": "WWYrzXgaxSLP",
//               "ref": "0241855b-a807-4fed-a22a-9fd4f68f090f",
//               "label": "I use these products occasionally"
//             },
//             {
//               "id": "hxMj2Qgi4Lz3",
//               "ref": "c323c950-6138-4f6f-95cd-3336670f49bb",
//               "label": "I regularly use these products"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "84WpyN6xeYUT",
//           "ref": "726db968-bbb4-4adf-a7a8-dfcbc44830eb",
//           "type": "multiple_choice",
//           "title": "How do you manage the consumption of processed foods and sugar? ",
//           "choices": [
//             {
//               "id": "Tb0RRyLDNw5c",
//               "ref": "373cb067-7270-42d2-aba8-5a4b87d94bf6",
//               "label": "My diet consists mostly of unprocessed foods, with minimal sugar intake"
//             },
//             {
//               "id": "fBxG5JPmg0o1",
//               "ref": "4fcccb5c-c0b7-4955-9c5b-45fab3a8d60b",
//               "label": "I occasionally consume processed foods and sugary products"
//             },
//             {
//               "id": "ohAIAE2ymv07",
//               "ref": "5f86cf53-8310-40e6-831e-609c2fae7ae4",
//               "label": "I regularly eat processed foods but try to limit sugar intake"
//             },
//             {
//               "id": "lcqb61g9mwZM",
//               "ref": "a3904aef-70ee-456e-8b66-ee36bd0bd70a",
//               "label": "Processed foods and sugary products are a staple in my diet"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "EtFyUyduPIi3",
//           "ref": "17c7197a-afe3-4ac2-8706-ebcc76402f4a",
//           "type": "multiple_choice",
//           "title": "How do you manage your consumption of red meat? ",
//           "choices": [
//             {
//               "id": "f0tCQ0oPFxlp",
//               "ref": "84fb6119-c7e1-44e0-a58f-c2b56aef3423",
//               "label": "I frequently consume red meat (daily)"
//             },
//             {
//               "id": "EavtEBI6emia",
//               "ref": "5f5fe6ef-e2b3-4f25-9755-594eb787bdf5",
//               "label": "I eat red meat several times a week"
//             },
//             {
//               "id": "fpAHv3lYypwI",
//               "ref": "7e8ca7fa-57b4-4e53-91fa-1df99956247d",
//               "label": "I consume red meat monthly"
//             },
//             {
//               "id": "oPUJrVTFaJWx",
//               "ref": "49b32022-11ce-4d3a-aa02-6b18f6889c87",
//               "label": "I rarely or never eat red meat"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "mb0YNF0RS0sM",
//           "ref": "9b084391-02b4-4c16-acaf-058d770d8ef4",
//           "type": "multiple_choice",
//           "title": "How much water do you drink daily?",
//           "choices": [
//             {
//               "id": "c0Jev733JhAF",
//               "ref": "cfc1f04d-a28f-4ab6-83fe-3daabcec8a44",
//               "label": "Less than 1 liter"
//             },
//             {
//               "id": "lrrjSmCSqwGU",
//               "ref": "c4cbd087-7530-45a6-8d89-6ad283fb030e",
//               "label": "1 to 2 liters"
//             },
//             {
//               "id": "ERXJ9BqzCMoV",
//               "ref": "1c4f5af1-1832-4a14-b0a9-67cf646686ac",
//               "label": "2 to 3 liters"
//             },
//             {
//               "id": "cbIRW68WB0Fm",
//               "ref": "57a4c9f9-3e4d-4dff-85e5-c80d59a17e05",
//               "label": "More than 3 liters"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "eZ5adnZQG1FU",
//           "ref": "21ce98f9-e3b1-46b0-96c8-d293d92026f3",
//           "type": "multiple_choice",
//           "title": "How often do you choose organic foods to reduce exposure to pesticides and chemicals? ",
//           "choices": [
//             {
//               "id": "vxyYlXnBzZge",
//               "ref": "1839ccc1-545c-4a0f-9579-ee5cf1973099",
//               "label": "Rarely or never"
//             },
//             {
//               "id": "yY1i009bCQ3b",
//               "ref": "a2d488b6-8c6c-4ea6-af66-f6f23eda56ec",
//               "label": "Occasionally, when convenient"
//             },
//             {
//               "id": "Wg2JKPX9lyKi",
//               "ref": "007fbf10-660e-411b-8361-f7f24eafeaf7",
//               "label": "Often, for the majority of my groceries"
//             },
//             {
//               "id": "WKAxFNUuF8kk",
//               "ref": "e43c9890-711c-4a25-b9e3-bfac9a5c3daa",
//               "label": "Always, I exclusively eat organic"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "idDPKxbTtbM1",
//           "ref": "969f25bf-c882-471c-b60b-8806c578e39f",
//           "type": "multiple_choice",
//           "title": "Do you use household cleaning and personal care products labeled as \"non-toxic\" or \"natural\"?",
//           "choices": [
//             {
//               "id": "sKHT6tU0FvdR",
//               "ref": "260ce8fa-b3d6-4d88-91dd-858535025740",
//               "label": "No, I don't specifically look for these products"
//             },
//             {
//               "id": "b2jlQwFfAhau",
//               "ref": "f7610618-1777-4c22-b3b9-64ae1597fd73",
//               "label": "Sometimes, I choose non-toxic options when available"
//             },
//             {
//               "id": "gSgZ1idtaW3W",
//               "ref": "0926a82f-c856-4a34-81aa-e59d8cc40230",
//               "label": "Often, I make a conscious effort to select non-toxic products"
//             },
//             {
//               "id": "fI3MXFF7aZGW",
//               "ref": "525b8c89-52db-413c-a2d6-1e39e0bcd500",
//               "label": "Always, my household exclusively uses non-toxic products"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "4wMR56l6Z7vo",
//           "ref": "7b69f9ca-4cc7-4116-b1b8-623a7b596bb8",
//           "type": "multiple_choice",
//           "title": "How do you approach reducing your exposure to environmental pollutants (e.g., air and water pollution)? ",
//           "choices": [
//             {
//               "id": "ypAYz0bRc7Yd",
//               "ref": "a56e1a66-6fdc-4acc-bffd-d9279ae19e6d",
//               "label": "I haven't taken specific actions to reduce my exposure"
//             },
//             {
//               "id": "vCtPDVGCwzUC",
//               "ref": "ef610390-41ac-4f2e-96f3-c7e26c218502",
//               "label": "I take basic steps, such as using water filters or air purifiers"
//             },
//             {
//               "id": "WHNJIJaTBr5V",
//               "ref": "cf3ace1e-0753-4dea-b667-200b8f5f4edd",
//               "label": "I actively minimize my exposure by using advanced filtration systems and avoiding polluted areas when possible"
//             },
//             {
//               "id": "73GYRLICkbxw",
//               "ref": "86663217-acb1-4697-b326-c29bab348145",
//               "label": "I rigorously manage my environment to ensure minimal exposure to pollutants"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "FVexnADuNMRT",
//           "ref": "3c3dd390-96e5-410a-b50c-ed9123feb8c8",
//           "type": "multiple_choice",
//           "title": "How do you harness positive stress for personal and professional growth? ",
//           "choices": [
//             {
//               "id": "0hFpoirOgFGk",
//               "ref": "2a97366f-b624-4fa3-a761-2da209ce3340",
//               "label": "I rarely see stress as positive or useful"
//             },
//             {
//               "id": "v5yAAYeYdVyG",
//               "ref": "3003283e-71ba-44b0-9d8c-74fc249c2067",
//               "label": "I sometimes recognize the benefits of positive stress but struggle to harness it effectively"
//             },
//             {
//               "id": "OcJiS0BJPt1O",
//               "ref": "caddcc0f-4566-4f64-8475-01c84b3b66ad",
//               "label": "I regularly leverage positive stress to motivate and challenge myself"
//             },
//             {
//               "id": "KTOOIJNqKAuz",
//               "ref": "5479c41a-7efe-41d5-88ec-7781c5e62273",
//               "label": "I consistently use positive stress as a catalyst for growth and achievement"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "k4JIcQA6BONo",
//           "ref": "3ac122b4-ad76-4003-9032-34feb7d8fc48",
//           "type": "multiple_choice",
//           "title": "What strategies do you employ to minimize negative stress in your life?",
//           "choices": [
//             {
//               "id": "3No1A3GWws68",
//               "ref": "a91ee44e-f249-4658-acc1-b863aaabc6b1",
//               "label": "I lack effective strategies for reducing negative stress"
//             },
//             {
//               "id": "uYDdqOeHJOwY",
//               "ref": "9f1d2eb3-008a-4ee7-a342-024d9848a1cf",
//               "label": "I occasionally use strategies like time management or problem-solving to reduce stress"
//             },
//             {
//               "id": "XaSWUAG3AdlY",
//               "ref": "38c90a06-801b-44c4-802b-792381a59dd5",
//               "label": "I have a set of reliable techniques that I regularly use to mitigate stress"
//             },
//             {
//               "id": "Mj13fZaHFjmB",
//               "ref": "a9a3f163-3ef8-4894-b34c-62ccd59f6f0f",
//               "label": "I proactively and systematically employ a variety of strategies to minimize stress"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "6uECKeaC3r7b",
//           "ref": "82cd2287-1111-47b7-a5ea-ced1cb63ab37",
//           "type": "multiple_choice",
//           "title": "How do you perceive stress in your life?",
//           "choices": [
//             {
//               "id": "pu2BxmoAuW0L",
//               "ref": "664ed4a3-98e2-4274-8081-614e5e54b7a3",
//               "label": "As an overwhelming force that frequently hinders my daily functioning"
//             },
//             {
//               "id": "XM22Y1KIvPUe",
//               "ref": "41dae6a3-ea40-47d7-bd0e-265b47316c74",
//               "label": "As a challenging but manageable aspect of life"
//             },
//             {
//               "id": "xjXRf1cv43nH",
//               "ref": "eacacecb-a30b-4266-a96e-64e6fa3ea71c",
//               "label": "As an opportunity for growth, despite its difficulties"
//             },
//             {
//               "id": "xteL4b7KA3aZ",
//               "ref": "5be97cfe-1af7-4c4a-a02d-7b7264742a7a",
//               "label": "As a natural part of life that I can often use to my advantage"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "kKjZnVMIWnE4",
//           "ref": "4ce82dc1-5889-4eca-9235-d044557e880e",
//           "type": "multiple_choice",
//           "title": "Do you monitor your stress levels through any form of measurement or biomarkers (e.g., heart rate variability)?",
//           "choices": [
//             {
//               "id": "pUFLQ2AcLpOY",
//               "ref": "5149fbd7-1624-4867-8c6c-38805041ef72",
//               "label": "No, I do not measure stress levels or use biomarkers"
//             },
//             {
//               "id": "W1CC5L5dvJCd",
//               "ref": "fe94b59d-b5d2-4680-90a8-81a483cf520b",
//               "label": "I am aware of stress indicators but do not actively monitor them"
//             },
//             {
//               "id": "txQEsgk2Lvo9",
//               "ref": "d8552ae8-825b-4826-8490-6626a09a9b9b",
//               "label": "I occasionally measure stress levels using technology or professional assistance"
//             },
//             {
//               "id": "09ThNd817k22",
//               "ref": "a534bae5-fccb-4ba8-aade-19e356b1069e",
//               "label": "I regularly monitor stress biomarkers to inform my stress management practices"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "UE1a1zoHSOJW",
//           "ref": "05e65856-4200-4ed1-ad81-94e09ef2f2fc",
//           "type": "multiple_choice",
//           "title": "How integral is meditation or mindfulness in your stress management toolkit?",
//           "choices": [
//             {
//               "id": "oDADDeQG9ndW",
//               "ref": "a2215962-f4ce-4180-8ed4-71180f438b14",
//               "label": "I do not practice meditation or mindfulness"
//             },
//             {
//               "id": "kBE27I46F2IE",
//               "ref": "aea05de2-e3b2-4c28-af9f-8802f3b41e4f",
//               "label": "I occasionally explore meditation or mindfulness practices"
//             },
//             {
//               "id": "hVYQ5J1xIWz8",
//               "ref": "5ae0e126-ff8c-4f70-91ae-b628c7d53800",
//               "label": "Meditation or mindfulness is a regular part of my routine for managing stress"
//             },
//             {
//               "id": "u9ouIrYnNXAi",
//               "ref": "6dcc0042-787e-4614-b2a4-d995a2720e25",
//               "label": "Daily meditation or mindfulness practices are crucial to my approach to stress"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "6p9YZfb4mCNL",
//           "ref": "c5e4ba56-2dbd-47c3-83ff-46637911763a",
//           "type": "multiple_choice",
//           "title": "How do you balance stress-inducing responsibilities with activities that promote relaxation or joy?",
//           "choices": [
//             {
//               "id": "fdMw0tI0SEqd",
//               "ref": "29fc01e9-aa7d-40f4-b5b6-e629783e3b57",
//               "label": "I struggle to find time for relaxation or joy amid stress-inducing responsibilities"
//             },
//             {
//               "id": "j5E5dRVgbk8Y",
//               "ref": "74c7256b-203e-4388-883b-d3ea58beb834",
//               "label": "I occasionally make time for activities that promote relaxation or joy"
//             },
//             {
//               "id": "AvXqygIjBXKF",
//               "ref": "5ca07bf9-7780-48e9-a2aa-77047473532c",
//               "label": "I strive for a balance, regularly incorporating relaxing or joyful activities"
//             },
//             {
//               "id": "hQLQvxU6XAJ3",
//               "ref": "04e61c26-99a0-43c8-b4e5-3c8743767875",
//               "label": "I prioritize a balance, ensuring that relaxing or joyful activities are part of my daily life"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "FWDHeNRP77oe",
//           "ref": "ccf001d9-8220-4de9-b8f1-3fb971d70dc7",
//           "type": "multiple_choice",
//           "title": "Do you regularly monitor and manage key health indicators (e.g., blood pressure, cholesterol, glucose levels)?",
//           "choices": [
//             {
//               "id": "GKpadai5LdVg",
//               "ref": "ba1b9a89-e8e3-4eb3-9db3-f1fc476f32b0",
//               "label": "No, I do not monitor these indicators"
//             },
//             {
//               "id": "9qXSIyfbiQaa",
//               "ref": "163b354b-143a-47fa-88b1-d1ec154465f1",
//               "label": "I monitor some indicators but not on a regular basis"
//             },
//             {
//               "id": "voTWseBDDDeP",
//               "ref": "5a690d26-7861-4efc-8a30-c56976b23036",
//               "label": "I regularly monitor these indicators on my own or with a healthcare provider"
//             },
//             {
//               "id": "WilrMqUBlDYL",
//               "ref": "9a81937e-8de9-4a06-af45-9472dac4f382",
//               "label": "I actively manage my health indicators with regular monitoring and adjustments as needed"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "YEQt8ic0LCyy",
//           "ref": "100bda0b-8093-45d5-850f-d53be08b390c",
//           "type": "multiple_choice",
//           "title": "How regularly do you engage in practices known to support longevity (e.g., healthy eating, regular physical activity, mental stimulation)?",
//           "choices": [
//             {
//               "id": "BIzshdAyIUBc",
//               "ref": "93561268-1e5a-4d97-849a-4b8c6c1cd6c8",
//               "label": "I do not regularly engage in these practices"
//             },
//             {
//               "id": "JjEgCAbZOHzL",
//               "ref": "eb5138f9-2ab7-4920-bab0-8aff6cf31678",
//               "label": "I engage in some of these practices occasionally"
//             },
//             {
//               "id": "bkxMekNsryOl",
//               "ref": "0f73f14f-bc1b-49af-8c5d-b5cc1b09b260",
//               "label": "I regularly engage in many of these practices"
//             },
//             {
//               "id": "WtLIBgCrDzng",
//               "ref": "ce2560d1-d170-468c-8a79-cc19d19b1435",
//               "label": "My lifestyle is centered around longevity-supporting practices"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "UDl1rtZaNBKK",
//           "ref": "66861779-7318-4e4b-8c6c-56135033552d",
//           "type": "multiple_choice",
//           "title": "How often do you participate in social activities or connect with your community?",
//           "choices": [
//             {
//               "id": "JOHiNNmLd0xk",
//               "ref": "f813ff14-cbf1-4df6-9aec-98e1a37741f8",
//               "label": "Rarely"
//             },
//             {
//               "id": "kPVgZBg4Cf60",
//               "ref": "050d0945-8cbd-4655-aade-30f948d384ca",
//               "label": "Monthly"
//             },
//             {
//               "id": "Y3AThxBOq98b",
//               "ref": "6a9e74cd-37e9-49c6-afd5-dad736969ed3",
//               "label": "Weekly"
//             },
//             {
//               "id": "8CC8rNbRdTLv",
//               "ref": "c0a7e3a7-f791-49c1-a17d-7e978f322f77",
//               "label": "Daily or almost daily"
//             }
//           ],
//           "properties": {}
//         },
//         {
//           "id": "MYUu4erMIcJ2",
//           "ref": "bc93f552-4f26-4af9-912c-45ec9c3cec94",
//           "type": "short_text",
//           "title": "Full Name",
//           "properties": {}
//         },
//         {
//           "id": "wgw4G25aeb7k",
//           "ref": "f18d5d01-68a8-42bd-a2d2-01f3b44a5b65",
//           "type": "email",
//           "title": "Email",
//           "properties": {}
//         }
//       ],
//       "endings": [
//         {
//           "id": "ArFlb71irwmh",
//           "ref": "94ca21a5-ec42-4e01-bed9-28f2cb7ee7cc",
//           "type": "thankyou_screen",
//           "title": "Total-Health Score: {{var:total_weighted_avg}}%",
//           "properties": {
//             "button_mode": "redirect",
//             "button_text": "Book Free Coaching Call",
//             "description": "{{var:rubric}}\n\nSign up for a call to receive your full results in each of our 10 Areas of Health! Get the best of both worlds when you sign up for a call with the guidance of a wellness professional.",
//             "share_icons": false,
//             "show_button": true,
//             "redirect_url": "https://calendly.com/arootah-coaching/schedule-your-30-minute-consultation"
//           }
//         }
//       ],
//       "outcome": {
//         "choices": [
//           {
//             "id": "uA4g7DbRZRMB",
//             "ref": "0ebaff89-a571-4975-b0a8-1dad59e6c8b3",
//             "title": "Total-Health Score: {{var:total_weighted_avg}}%",
//             "counter_variable": "counter_243a6ff4_aec7_4a9f_9532_d04aed75e593",
//             "thankyou_screen_ref": "94ca21a5-ec42-4e01-bed9-28f2cb7ee7cc"
//           }
//         ],
//         "variable": "winning_outcome_id"
//       }
//     },
//     "submitted_at": "2024-04-19T08:08:26Z"
//   }
// }

const parsePayload = async (payload:any) => {

  const formResponse = payload.form_response;
  const formId = formResponse.form_id;
  const answers = formResponse.answers;
  const questions = formResponse.definition.fields;
  const variables = formResponse.variables
  const totalWeightedAvg = variables.find((variable:any) => variable.key === "total_weighted_avg")?.number; 
  const email = answers.find((answer:any) => answer.field.type === "email")?.email;

  const scoreKeys = [
    "prevention_score",
    "sleep_score",
    "nutriton_score",
    "structure_score",
    "exercise_score",
    "weight_management_score",
    "perils_score",
    "detoxification_score",
    "stress_score",
    "longevity_score"
  ];
  
  const scoreDict = {};
  scoreKeys.forEach(key => {
    const variable = variables.find(variable => variable.key === key);
    scoreDict[key.replace('_score', '')] = variable ? variable.number : null;
  });

  // Map question answer pairs to a dictionary with question, answer and type
  let questionAnswerMap = answers.map((answer:any) => {
    // Question must not be Full Name or Email
    const question = questions.find((question:any) => question.id === answer.field.id);

    return {
      question: question.title,
      answer: answer.choice?.label ?? answer.text,
      type: question.type,
    };
  }
  );

  // Remove the questions where question is Email of Full Name
  questionAnswerMap = questionAnswerMap.filter((qa:any) => qa.question !== "Email" && qa.question !== "Full Name");

 
  const data = {
    formId,
    totalWeightedAvg,
    email,
    assesmentId: FORM_ID_MAP[formId],
    questionAnswerMap,
    scoreDict
  };

  return data;
}
  
 
const insertToWebhooks = async (supabase: any, payload: any, payloadParsed:any) => {
  // Insert the whole payload to the payload column as text and return the result
  const { data: insertData, error } = await supabase
    .from("webhooks")
    .insert([
      {
        payload: payload,
        payload_parsed: payloadParsed,
        email: payloadParsed.email,
        assesment_id: payloadParsed.assesmentId,
        total_avg: payloadParsed.totalWeightedAvg,
        score_dict: payloadParsed.scoreDict,
      },
    ])
    .select("id");

  if (error) {
    throw new Error(error.message);
  }
  return insertData;
};


serve(async (req) => {

  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("Ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization:
            "Bearer " + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        },
      },
    }
  );

  try {

    const payload = await req.json();

    // Read the Typeform-Signature header
    const header = req.headers.get("typeform-signature");

    // Insert the payload to the mock_payloads table
    const { data: insertData, error } = await supabase
      .from("mock_payloads")
      .insert([
        {
          payload: payload,
        },
      ])
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    // Parse the payload
    // const payloadParsed = await parsePayload(payload);

    // Insert the payload to the database
    // await insertToWebhooks(supabase,payload,payloadParsed);

    // Return data as response
    return new Response(
      JSON.stringify({
        message: "Webhook received",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
