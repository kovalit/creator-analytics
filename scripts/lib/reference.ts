// Справочники demo-набора: creator, соцсети, сферы, критерии, партнёры,
// маркетплейсы, товары, шоу, кампании, публикации.
// Все машинные имена/ID на английском, отображаемые подписи — на русском.

export const CREATOR = {
  id: 'creator_alina',
  userId: 'user_4102',
  displayName: 'Алина Морозова',
  username: '@alina.beauty',
  avatar: '/demo/avatars/alina.svg',
  bio: 'Бьюти и лайфстайл. Честные сравнения по шоу «Что лучше».',
  categorySphereIds: ['sphere_beauty', 'sphere_skincare', 'sphere_fashion'],
  status: 'active' as const,
  verified: true,
  joinedAt: '2024-11-12',
};

export const SOCIAL_ACCOUNTS = [
  {
    id: 'social_vk_1',
    creatorId: CREATOR.id,
    platform: 'vk',
    label: 'VK',
    handle: '@alina_beauty',
    url: 'https://vk.com/alina_beauty',
    connected: true,
    followers: 215000,
  },
  {
    id: 'social_telegram_1',
    creatorId: CREATOR.id,
    platform: 'telegram',
    label: 'Telegram',
    handle: '@alina_beauty',
    url: 'https://t.me/alina_beauty',
    connected: true,
    followers: 127000,
  },
  {
    id: 'social_youtube_1',
    creatorId: CREATOR.id,
    platform: 'youtube',
    label: 'YouTube',
    handle: '@alina.beauty',
    url: 'https://youtube.com/@alina.beauty',
    connected: true,
    followers: 380000,
  },
  {
    id: 'social_rutube_1',
    creatorId: CREATOR.id,
    platform: 'rutube',
    label: 'RUTUBE',
    handle: 'alina_beauty',
    url: 'https://rutube.ru/channel/alina_beauty',
    connected: true,
    followers: 120000,
  },
];

export const SPHERES = [
  { id: 'sphere_beauty', name: 'beauty', label: 'Красота', parentId: null },
  { id: 'sphere_skincare', name: 'skincare', label: 'Уход за кожей', parentId: 'sphere_beauty' },
  { id: 'sphere_face_cream', name: 'face_cream', label: 'Кремы для лица', parentId: 'sphere_skincare' },
  { id: 'sphere_spf', name: 'spf', label: 'SPF-защита', parentId: 'sphere_skincare' },
  { id: 'sphere_perfume', name: 'perfume', label: 'Парфюмерия', parentId: 'sphere_beauty' },
  { id: 'sphere_fashion', name: 'fashion', label: 'Одежда', parentId: null },
  { id: 'sphere_sportswear', name: 'sportswear', label: 'Спортивная одежда', parentId: 'sphere_fashion' },
  { id: 'sphere_travel', name: 'travel', label: 'Путешествия', parentId: null },
  { id: 'sphere_hotels', name: 'hotels', label: 'Отели', parentId: 'sphere_travel' },
  { id: 'sphere_healthy_food', name: 'healthy_food', label: 'Здоровое питание', parentId: null },
  { id: 'sphere_restaurants', name: 'restaurants', label: 'Рестораны', parentId: null },
  { id: 'sphere_fitness', name: 'fitness', label: 'Фитнес', parentId: null },
  { id: 'sphere_home', name: 'home', label: 'Товары для дома', parentId: null },
  { id: 'sphere_home_appliance', name: 'home_appliance', label: 'Техника', parentId: 'sphere_home' },
  { id: 'sphere_home_interior', name: 'home_interior', label: 'Интерьер', parentId: 'sphere_home' },
];

type CriterionSeed = { name: string; label: string; code: string; description: string };

const FACE_CREAM_CRITERIA: CriterionSeed[] = [
  { name: 'hydration', label: 'Увлажнение', code: 'hydr', description: 'Насколько хорошо средство поддерживает ощущение увлажнённой кожи.' },
  { name: 'composition', label: 'Состав', code: 'comp', description: 'Качество и безопасность ингредиентов в составе.' },
  { name: 'sensitive_skin', label: 'Для чувствительной кожи', code: 'sens', description: 'Подходит ли средство для чувствительной и склонной к реакциям кожи.' },
  { name: 'texture', label: 'Текстура', code: 'text', description: 'Приятность текстуры при нанесении.' },
  { name: 'absorption', label: 'Впитываемость', code: 'absb', description: 'Как быстро и полно крем впитывается без остатка.' },
  { name: 'comfort', label: 'Комфорт', code: 'cmft', description: 'Ощущение комфорта на коже в течение дня.' },
  { name: 'scent', label: 'Аромат', code: 'scnt', description: 'Приятность и выраженность аромата.' },
  { name: 'economy', label: 'Экономичность', code: 'econ', description: 'Насколько экономно расходуется средство.' },
  { name: 'packaging', label: 'Упаковка', code: 'pack', description: 'Удобство и качество упаковки.' },
  { name: 'price_value', label: 'Цена/ценность', code: 'pval', description: 'Соотношение цены и полученного результата.' },
  { name: 'no_stickiness', label: 'Отсутствие липкости', code: 'nstk', description: 'Нет ли ощущения липкости после нанесения.' },
  { name: 'longevity', label: 'Длительность эффекта', code: 'long', description: 'Как долго сохраняется эффект увлажнения.' },
];

const OTHER_CRITERIA: Record<string, CriterionSeed[]> = {
  sphere_spf: [
    { name: 'spf_protection', label: 'Степень защиты', code: 'spfp', description: 'Эффективность защиты от UV-излучения.' },
    { name: 'no_white_cast', label: 'Без белёсого следа', code: 'nwct', description: 'Не оставляет ли средство белый налёт.' },
    { name: 'water_resistance', label: 'Водостойкость', code: 'watr', description: 'Сохраняется ли защита при контакте с водой.' },
    { name: 'under_makeup', label: 'Под макияж', code: 'undm', description: 'Насколько хорошо ложится под макияж.' },
  ],
  sphere_perfume: [
    { name: 'longevity_perfume', label: 'Стойкость', code: 'pfln', description: 'Как долго держится аромат.' },
    { name: 'sillage', label: 'Шлейф', code: 'sill', description: 'Насколько выражен шлейф аромата.' },
    { name: 'uniqueness', label: 'Оригинальность', code: 'uniq', description: 'Узнаваемость и оригинальность аромата.' },
    { name: 'value_perfume', label: 'Цена/объём', code: 'pfvl', description: 'Соотношение цены и объёма флакона.' },
  ],
  sphere_fashion: [
    { name: 'fabric_quality', label: 'Качество ткани', code: 'fabq', description: 'Качество и износостойкость материала.' },
    { name: 'fit', label: 'Посадка', code: 'fitt', description: 'Насколько хорошо вещь сидит по фигуре.' },
    { name: 'style', label: 'Стиль', code: 'styl', description: 'Актуальность и привлекательность дизайна.' },
  ],
  sphere_sportswear: [
    { name: 'breathability', label: 'Дышащесть', code: 'brth', description: 'Отводит ли ткань влагу и даёт ли дышать коже.' },
    { name: 'stretch', label: 'Эластичность', code: 'strc', description: 'Свобода движения во время тренировки.' },
    { name: 'durability_sport', label: 'Износостойкость', code: 'dusp', description: 'Как вещь переносит стирки и нагрузки.' },
  ],
  sphere_travel: [
    { name: 'route_value', label: 'Ценность маршрута', code: 'rval', description: 'Насколько маршрут оправдывает ожидания.' },
    { name: 'service_travel', label: 'Сервис', code: 'srvt', description: 'Уровень сервиса в поездке.' },
  ],
  sphere_hotels: [
    { name: 'cleanliness', label: 'Чистота', code: 'clnl', description: 'Чистота номеров и общих зон.' },
    { name: 'location', label: 'Расположение', code: 'locn', description: 'Удобство расположения отеля.' },
    { name: 'breakfast', label: 'Завтрак', code: 'brkf', description: 'Качество и разнообразие завтрака.' },
    { name: 'value_hotel', label: 'Цена/качество', code: 'htvl', description: 'Соотношение цены и уровня отеля.' },
  ],
  sphere_healthy_food: [
    { name: 'ingredients_food', label: 'Состав', code: 'ingf', description: 'Натуральность и качество ингредиентов.' },
    { name: 'taste', label: 'Вкус', code: 'tast', description: 'Вкусовые качества продукта.' },
    { name: 'nutrition', label: 'Пищевая ценность', code: 'nutr', description: 'Баланс белков, жиров и углеводов.' },
  ],
  sphere_restaurants: [
    { name: 'cuisine', label: 'Кухня', code: 'cusn', description: 'Качество и подача блюд.' },
    { name: 'atmosphere', label: 'Атмосфера', code: 'atms', description: 'Общая атмосфера заведения.' },
  ],
  sphere_fitness: [
    { name: 'equipment', label: 'Оборудование', code: 'eqpm', description: 'Качество и ассортимент оборудования.' },
    { name: 'trainers', label: 'Тренеры', code: 'trnr', description: 'Квалификация тренерского состава.' },
  ],
  sphere_home: [
    { name: 'build_quality', label: 'Качество сборки', code: 'bldq', description: 'Надёжность материалов и сборки.' },
    { name: 'value_home', label: 'Цена/качество', code: 'hmvl', description: 'Соотношение цены и качества.' },
  ],
  sphere_home_appliance: [
    { name: 'energy_efficiency', label: 'Энергоэффективность', code: 'enef', description: 'Экономичность энергопотребления.' },
    { name: 'noise', label: 'Уровень шума', code: 'nois', description: 'Насколько тихо работает техника.' },
    { name: 'reliability', label: 'Надёжность', code: 'rely', description: 'Долговечность и отказоустойчивость.' },
  ],
  sphere_home_interior: [
    { name: 'design_interior', label: 'Дизайн', code: 'dsgn', description: 'Эстетика и сочетаемость в интерьере.' },
    { name: 'material_interior', label: 'Материалы', code: 'mtri', description: 'Качество используемых материалов.' },
  ],
};

export const CRITERIA = (() => {
  const list: {
    id: string;
    name: string;
    label: string;
    description: string;
    code: string;
    sphereIds: string[];
  }[] = [];
  for (const c of FACE_CREAM_CRITERIA) {
    list.push({
      id: `criterion_${c.name}`,
      name: c.name,
      label: c.label,
      description: c.description,
      code: c.code,
      sphereIds: ['sphere_face_cream'],
    });
  }
  for (const [sphereId, arr] of Object.entries(OTHER_CRITERIA)) {
    for (const c of arr) {
      list.push({
        id: `criterion_${c.name}`,
        name: c.name,
        label: c.label,
        description: c.description,
        code: c.code,
        sphereIds: [sphereId],
      });
    }
  }
  return list;
})();

export const PARTNERS = [
  { id: 'partner_nordskin', label: 'NordSkin', companyName: 'ООО «НордСкин»', logo: '/demo/brands/nordskin.svg', website: 'https://nordskin.demo', ecosystemMember: true },
  { id: 'partner_lumera', label: 'Lumera', companyName: 'ООО «Люмера»', logo: '/demo/brands/lumera.svg', website: 'https://lumera.demo', ecosystemMember: true },
  { id: 'partner_aqovia', label: 'Aqovia', companyName: 'ООО «Аковиа»', logo: '/demo/brands/aqovia.svg', website: 'https://aqovia.demo', ecosystemMember: false },
  { id: 'partner_botane', label: 'Botané', companyName: 'ООО «Ботанэ»', logo: '/demo/brands/botane.svg', website: 'https://botane.demo', ecosystemMember: true },
  { id: 'partner_skinlab', label: 'SkinLab', companyName: 'ООО «СкинЛаб»', logo: '/demo/brands/skinlab.svg', website: 'https://skinlab.demo', ecosystemMember: false },
  { id: 'partner_velura', label: 'Velura', companyName: 'ООО «Велюра»', logo: '/demo/brands/velura.svg', website: 'https://velura.demo', ecosystemMember: true },
  { id: 'partner_purenord', label: 'PureNord', companyName: 'ООО «ПьюрНорд»', logo: '/demo/brands/purenord.svg', website: 'https://purenord.demo', ecosystemMember: false },
  { id: 'partner_hydrael', label: 'Hydrael', companyName: 'ООО «Гидраэль»', logo: '/demo/brands/hydrael.svg', website: 'https://hydrael.demo', ecosystemMember: true },
  { id: 'partner_mireya', label: 'Mireya', companyName: 'ООО «Мирейя»', logo: '/demo/brands/mireya.svg', website: 'https://mireya.demo', ecosystemMember: false },
  { id: 'partner_verenska', label: 'Verenska', companyName: 'ООО «Веренска»', logo: '/demo/brands/verenska.svg', website: 'https://verenska.demo', ecosystemMember: true },
];

export const MARKETPLACES = [
  { id: 'marketplace_whatsbetter', name: 'whatsbetter', label: 'Whatsbetter', channelType: 'whatsbetter' },
  { id: 'marketplace_ozon', name: 'ozon', label: 'Ozon', channelType: 'marketplace' },
  { id: 'marketplace_wb', name: 'wildberries', label: 'Wildberries', channelType: 'marketplace' },
  { id: 'marketplace_yandex', name: 'yandex_market', label: 'Яндекс Маркет', channelType: 'marketplace' },
];

// 20 кремов для лица, по 2 на каждого из 10 партнёров.
const CREAM_NAMES: [string, string][] = [
  ['aqua_balance_cream', 'Aqua Balance Cream'],
  ['deep_hydra_night', 'Deep Hydra Night'],
  ['lumera_glow_day', 'Lumera Glow Day'],
  ['lumera_silk_repair', 'Lumera Silk Repair'],
  ['aqovia_pure_moisture', 'Aqovia Pure Moisture'],
  ['aqovia_calm_barrier', 'Aqovia Calm Barrier'],
  ['botane_herbal_cream', 'Botané Herbal Cream'],
  ['botane_sensitive_care', 'Botané Sensitive Care'],
  ['skinlab_retinol_soft', 'SkinLab Retinol Soft'],
  ['skinlab_daily_shield', 'SkinLab Daily Shield'],
  ['velura_velvet_touch', 'Velura Velvet Touch'],
  ['velura_aqua_gel', 'Velura Aqua Gel'],
  ['purenord_arctic_hydra', 'PureNord Arctic Hydra'],
  ['purenord_light_fluid', 'PureNord Light Fluid'],
  ['hydrael_intense_h2o', 'Hydrael Intense H2O'],
  ['hydrael_ceramide_rich', 'Hydrael Ceramide Rich'],
  ['mireya_rose_nutrition', 'Mireya Rose Nutrition'],
  ['mireya_matte_balance', 'Mireya Matte Balance'],
  ['verenska_bio_restore', 'Verenska Bio Restore'],
  ['verenska_night_recovery', 'Verenska Night Recovery'],
];

export const ENTITIES = (() => {
  const skinTypesPool = [
    ['normal', 'dry'],
    ['normal', 'dry', 'sensitive'],
    ['oily', 'combination'],
    ['all'],
    ['dry', 'sensitive'],
  ];
  // детерминированный порядок рейтинга
  const scoreOrder = [
    0.91, 0.88, 0.86, 0.84, 0.82, 0.8, 0.78, 0.77, 0.75, 0.73, 0.71, 0.69,
    0.68, 0.66, 0.64, 0.62, 0.61, 0.59, 0.57, 0.55,
  ];
  const counts = [
    5821, 5120, 4870, 4410, 3980, 3620, 3310, 3020, 2780, 2510, 2290, 2080,
    1910, 1740, 1580, 1420, 1290, 1150, 1020, 910,
  ];
  return CREAM_NAMES.map((pair, i) => {
    const partner = PARTNERS[Math.floor(i / 2)];
    const volume = [30, 50, 50, 75][i % 4];
    return {
      id: `entity_cream_${String(i + 1).padStart(2, '0')}`,
      sphereId: 'sphere_face_cream',
      type: 'product' as const,
      name: pair[0],
      label: pair[1],
      brand: partner.label,
      partnerId: partner.id,
      image: `/demo/products/cream-${String(i + 1).padStart(2, '0')}.svg`,
      properties: {
        volumeMl: volume,
        skinTypes: skinTypesPool[i % skinTypesPool.length],
      },
      rating: {
        score: scoreOrder[i],
        place: i + 1,
        countScores: counts[i],
      },
    };
  });
})();

export const SHOWS = [
  {
    id: 'show_what_is_better',
    name: 'what_is_better',
    label: 'Что лучше',
    description:
      'Производители одной сферы сравнивают продукты по понятным зрителю критериям.',
  },
];

// Кампании: по одной (или две) на месяц, сентябрь — флагман «Кремы для лица».
export const CAMPAIGNS = [
  {
    id: 'campaign_appliances_2026_04',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_home_appliance',
    title: 'Что лучше: техника для кухни',
    status: 'completed' as const,
    month: '2026-04',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    heroImage: '/demo/campaigns/appliances.svg',
    partnerIds: ['partner_skinlab', 'partner_purenord'],
    entityIds: [],
    defaultCommissionRate: 0.09,
    attributionWindowDays: 30,
    trackingCode: 'alina-appliances-apr26',
  },
  {
    id: 'campaign_perfume_2026_05',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_perfume',
    title: 'Что лучше: нишевая парфюмерия',
    status: 'completed' as const,
    month: '2026-05',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    heroImage: '/demo/campaigns/perfume.svg',
    partnerIds: ['partner_lumera', 'partner_mireya'],
    entityIds: [],
    defaultCommissionRate: 0.12,
    attributionWindowDays: 30,
    trackingCode: 'alina-perfume-may26',
  },
  {
    id: 'campaign_hotels_2026_06',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_hotels',
    title: 'Что лучше: отели у моря',
    status: 'completed' as const,
    month: '2026-06',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    heroImage: '/demo/campaigns/hotels.svg',
    partnerIds: ['partner_velura', 'partner_botane'],
    entityIds: [],
    defaultCommissionRate: 0.08,
    attributionWindowDays: 45,
    trackingCode: 'alina-hotels-jun26',
  },
  {
    id: 'campaign_healthyfood_2026_07',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_healthy_food',
    title: 'Что лучше: здоровые перекусы',
    status: 'completed' as const,
    month: '2026-07',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    heroImage: '/demo/campaigns/healthyfood.svg',
    partnerIds: ['partner_aqovia', 'partner_hydrael'],
    entityIds: [],
    defaultCommissionRate: 0.11,
    attributionWindowDays: 30,
    trackingCode: 'alina-food-jul26',
  },
  {
    id: 'campaign_sportswear_2026_08',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_sportswear',
    title: 'Что лучше: спортивная одежда',
    status: 'completed' as const,
    month: '2026-08',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    heroImage: '/demo/campaigns/sportswear.svg',
    partnerIds: ['partner_verenska', 'partner_velura'],
    entityIds: [],
    defaultCommissionRate: 0.1,
    attributionWindowDays: 30,
    trackingCode: 'alina-sport-aug26',
  },
  {
    id: 'campaign_spf_2026_08',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_spf',
    title: 'Что лучше: SPF-защита 50',
    status: 'completed' as const,
    month: '2026-08',
    startDate: '2026-08-10',
    endDate: '2026-08-31',
    heroImage: '/demo/campaigns/spf.svg',
    partnerIds: ['partner_nordskin', 'partner_hydrael'],
    entityIds: [],
    defaultCommissionRate: 0.13,
    attributionWindowDays: 30,
    trackingCode: 'alina-spf-aug26',
  },
  {
    id: 'campaign_face_cream_2026_09',
    showId: 'show_what_is_better',
    creatorId: CREATOR.id,
    sphereId: 'sphere_face_cream',
    title: 'Что лучше: кремы для лица',
    status: 'active' as const,
    month: '2026-09',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    heroImage: '/demo/campaigns/face-cream.svg',
    partnerIds: PARTNERS.map((p) => p.id),
    entityIds: ENTITIES.map((e) => e.id),
    defaultCommissionRate: 0.1,
    attributionWindowDays: 30,
    trackingCode: 'alina-facecream-sep26',
  },
];

type PubSeed = {
  idSuffix: string;
  platform: string;
  socialAccountId: string;
  format: string;
  title: string;
  publishDay: number; // день месяца
  weightMult: number; // относительная доля просмотров
};

const CAMPAIGN_PUBS: Record<string, PubSeed[]> = {
  campaign_appliances_2026_04: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: 8 кухонных помощников', publishDay: 3, weightMult: 1.3 },
    { idSuffix: 'vk_01', platform: 'vk', socialAccountId: 'social_vk_1', format: 'video', title: 'Техника для кухни: честный тест', publishDay: 8, weightMult: 1.1 },
    { idSuffix: 'tg_01', platform: 'telegram', socialAccountId: 'social_telegram_1', format: 'telegram_post', title: 'Подборка: что реально стоит покупать', publishDay: 14, weightMult: 0.8 },
  ],
  campaign_perfume_2026_05: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: нишевые ароматы', publishDay: 4, weightMult: 1.25 },
    { idSuffix: 'vk_01', platform: 'vk', socialAccountId: 'social_vk_1', format: 'short_video', title: 'Парфюм, который все спрашивают', publishDay: 11, weightMult: 1.15 },
    { idSuffix: 'rt_01', platform: 'rutube', socialAccountId: 'social_rutube_1', format: 'video', title: 'Разбор ароматов по критериям', publishDay: 18, weightMult: 0.6 },
  ],
  campaign_hotels_2026_06: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: отели у моря', publishDay: 2, weightMult: 1.3 },
    { idSuffix: 'vk_01', platform: 'vk', socialAccountId: 'social_vk_1', format: 'post', title: 'Где отдохнуть: сравнение отелей', publishDay: 9, weightMult: 1.1 },
    { idSuffix: 'tg_01', platform: 'telegram', socialAccountId: 'social_telegram_1', format: 'telegram_post', title: 'Отели: цена против сервиса', publishDay: 16, weightMult: 0.8 },
  ],
  campaign_healthyfood_2026_07: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: здоровые перекусы', publishDay: 3, weightMult: 1.25 },
    { idSuffix: 'vk_01', platform: 'vk', socialAccountId: 'social_vk_1', format: 'short_video', title: 'Полезные снеки: тест на вкус', publishDay: 10, weightMult: 1.15 },
    { idSuffix: 'rt_01', platform: 'rutube', socialAccountId: 'social_rutube_1', format: 'video', title: 'Состав vs вкус: что выбрать', publishDay: 19, weightMult: 0.6 },
  ],
  campaign_sportswear_2026_08: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: форма для тренировок', publishDay: 2, weightMult: 1.3 },
    { idSuffix: 'vk_01', platform: 'vk', socialAccountId: 'social_vk_1', format: 'short_video', title: 'Спортивная одежда: что носить', publishDay: 7, weightMult: 1.1 },
  ],
  campaign_spf_2026_08: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: SPF 50', publishDay: 11, weightMult: 1.2 },
    { idSuffix: 'tg_01', platform: 'telegram', socialAccountId: 'social_telegram_1', format: 'telegram_post', title: 'SPF без белого следа: топ', publishDay: 17, weightMult: 0.85 },
  ],
  campaign_face_cream_2026_09: [
    { idSuffix: 'yt_01', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'video', title: 'Что лучше: 20 кремов для лица', publishDay: 3, weightMult: 1.35 },
    { idSuffix: 'vk_01', platform: 'vk', socialAccountId: 'social_vk_1', format: 'video', title: 'Кремы для лица: большой тест', publishDay: 5, weightMult: 1.2 },
    { idSuffix: 'tg_01', platform: 'telegram', socialAccountId: 'social_telegram_1', format: 'telegram_post', title: 'Кремы для лица: что выбрать', publishDay: 7, weightMult: 0.85 },
    { idSuffix: 'rt_01', platform: 'rutube', socialAccountId: 'social_rutube_1', format: 'video', title: 'Разбор кремов по критериям', publishDay: 10, weightMult: 0.6 },
    { idSuffix: 'yt_02', platform: 'youtube', socialAccountId: 'social_youtube_1', format: 'short_video', title: 'Топ-3 крема за минуту', publishDay: 15, weightMult: 0.95 },
    { idSuffix: 'vk_02', platform: 'vk', socialAccountId: 'social_vk_1', format: 'short_video', title: 'Крем дня: быстрый обзор', publishDay: 20, weightMult: 0.8 },
  ],
};

export const PUBLICATIONS = (() => {
  const list: {
    id: string;
    campaignId: string;
    creatorId: string;
    socialAccountId: string;
    platform: string;
    format: string;
    title: string;
    publishedAt: string;
    publishDay: number;
    thumbnail: string;
    trackingCode: string;
    status: string;
    weightMult: number;
  }[] = [];
  for (const campaign of CAMPAIGNS) {
    const seeds = CAMPAIGN_PUBS[campaign.id] ?? [];
    for (const s of seeds) {
      const id = `pub_${campaign.id.replace('campaign_', '')}_${s.idSuffix}`;
      const day = String(s.publishDay).padStart(2, '0');
      const month = campaign.month.split('-')[1];
      const year = campaign.month.split('-')[0];
      list.push({
        id,
        campaignId: campaign.id,
        creatorId: CREATOR.id,
        socialAccountId: s.socialAccountId,
        platform: s.platform,
        format: s.format,
        title: s.title,
        publishedAt: `${year}-${month}-${day}T18:00:00+03:00`,
        publishDay: s.publishDay,
        thumbnail: `/demo/content/${id}.svg`,
        trackingCode: `${campaign.trackingCode}-${s.idSuffix}`,
        status: 'published',
        weightMult: s.weightMult,
      });
    }
  }
  return list;
})();

// Профили площадок (для вариативности конверсий в daily-данных).
export const PLATFORM_PROFILES: Record<
  string,
  { ctr: number; cart: number; order: number; redeem: number; aov: number; eng: number }
> = {
  youtube: { ctr: 0.85, cart: 0.98, order: 0.95, redeem: 1.0, aov: 1.05, eng: 0.9 },
  vk: { ctr: 1.0, cart: 1.0, order: 1.0, redeem: 1.0, aov: 1.0, eng: 1.0 },
  telegram: { ctr: 1.35, cart: 1.05, order: 1.1, redeem: 1.03, aov: 0.95, eng: 1.25 },
  rutube: { ctr: 0.95, cart: 0.97, order: 0.98, redeem: 0.98, aov: 0.98, eng: 0.85 },
};

// Каналы продаж (доли и привязка к маркетплейсам/партнёрам).
export const SALES_CHANNELS = [
  { type: 'whatsbetter', marketplaceId: 'marketplace_whatsbetter', weight: 0.4 },
  { type: 'manufacturer_external', marketplaceId: null, weight: 0.16 },
  { type: 'manufacturer_ecosystem', marketplaceId: null, weight: 0.2 },
  { type: 'marketplace', marketplaceId: 'marketplace_ozon', weight: 0.11 },
  { type: 'marketplace', marketplaceId: 'marketplace_wb', weight: 0.08 },
  { type: 'marketplace', marketplaceId: 'marketplace_yandex', weight: 0.05 },
];

// Целевые месячные агрегаты. Сентябрь — точный anchor.
export const MONTHLY_TARGETS: Record<
  string,
  {
    views: number;
    clicks: number;
    productViews: number;
    addToCart: number;
    orders: number;
    purchasedOrders: number;
    gmv: number;
    commission: number;
  }
> = {
  '2026-04': { views: 48000, clicks: 7000, productViews: 5040, addToCart: 1806, orders: 422, purchasedOrders: 333, gmv: 1150000, commission: 115000 },
  '2026-05': { views: 57000, clicks: 8900, productViews: 6408, addToCart: 2287, orders: 518, purchasedOrders: 414, gmv: 1450000, commission: 145000 },
  '2026-06': { views: 65000, clicks: 10600, productViews: 7632, addToCart: 2714, orders: 665, purchasedOrders: 535, gmv: 1900000, commission: 190000 },
  '2026-07': { views: 73000, clicks: 12200, productViews: 8784, addToCart: 3123, orders: 772, purchasedOrders: 625, gmv: 2250000, commission: 225000 },
  '2026-08': { views: 84000, clicks: 14900, productViews: 10728, addToCart: 3807, orders: 998, purchasedOrders: 813, gmv: 2950000, commission: 295000 },
  '2026-09': { views: 100000, clicks: 18400, productViews: 13248, addToCart: 4700, orders: 1260, purchasedOrders: 1035, gmv: 3800000, commission: 380000 },
};

export const MONTHS = Object.keys(MONTHLY_TARGETS);

export const CAMPAIGNS_BY_MONTH: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const c of CAMPAIGNS) {
    (map[c.month] ??= []).push(c.id);
  }
  return map;
})();

export const MANIFEST = {
  datasetVersion: 1,
  generatedAt: '2026-10-01T12:00:00+03:00',
  locale: 'ru-RU',
  currency: 'RUB',
  timezone: 'Europe/Moscow',
  demoPeriod: { from: '2026-04-01', to: '2026-09-30' },
  defaultPeriod: '30d',
  creatorId: CREATOR.id,
  creatorName: CREATOR.displayName,
  anchor: {
    views: 100000,
    clicks: 18400,
    addToCart: 4700,
    orders: 1260,
    purchasedOrders: 1035,
    gmv: 3800000,
    commission: 380000,
  },
};

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function weekdayOf(month: string, day: number): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, day).getDay(); // 0=вс
}
