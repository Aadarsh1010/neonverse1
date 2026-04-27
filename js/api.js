/* ═══════════════════════════════════════════════════
   NEONVERSE — API Module
   Handles all API calls with caching + fallbacks
   ═══════════════════════════════════════════════════ */

const API = (() => {
  const JIKAN_BASE = 'https://api.jikan.moe/v4';
  const RAWG_BASE = 'https://api.rawg.io/api/games';
  const RAWG_KEY = 'b8584c88c4c84bb7a6e02fd76c2f8975';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  /* ═══════════════════════════════════════════════════
     HARDCODED FALLBACK GAMES — Always works
     ═══════════════════════════════════════════════════ */
  const FALLBACK_GAMES = [
    {
      name: "Elden Ring",
      rating: 4.9,
      metacritic: 96,
      released: "2022-02-25",
      background_image: "https://images.unsplash.com/photo-1619919239082-5e2d2471eb48?w=800",
      genres: [{ name: "RPG", slug: "role-playing-games-rpg" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 5" } },
        { platform: { name: "Xbox Series X" } }
      ],
      description_raw: "The new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between."
    },
    {
      name: "God of War",
      rating: 4.8,
      metacritic: 94,
      released: "2018-04-20",
      background_image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
      genres: [{ name: "Action", slug: "action" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 4" } },
        { platform: { name: "PlayStation 5" } }
      ],
      description_raw: "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse gods and monsters."
    },
    {
      name: "Cyberpunk 2077",
      rating: 4.5,
      metacritic: 90,
      released: "2020-12-10",
      background_image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
      genres: [{ name: "RPG", slug: "role-playing-games-rpg" }, { name: "Action", slug: "action" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 5" } },
        { platform: { name: "Xbox Series X" } }
      ],
      description_raw: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival."
    },
    {
      name: "Red Dead Redemption 2",
      rating: 4.9,
      metacritic: 97,
      released: "2018-10-26",
      background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
      genres: [{ name: "Adventure", slug: "adventure" }, { name: "Action", slug: "action" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 4" } },
        { platform: { name: "Xbox One" } }
      ],
      description_raw: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America."
    },
    {
      name: "The Witcher 3: Wild Hunt",
      rating: 4.8,
      metacritic: 95,
      released: "2015-05-19",
      background_image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800",
      genres: [{ name: "RPG", slug: "role-playing-games-rpg" }, { name: "Action", slug: "action" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 5" } },
        { platform: { name: "Nintendo Switch" } }
      ],
      description_raw: "As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy, a living weapon that can alter the shape of the world."
    },
    {
      name: "Hollow Knight",
      rating: 4.6,
      metacritic: 90,
      released: "2017-02-24",
      background_image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
      genres: [{ name: "Indie", slug: "indie" }, { name: "Action", slug: "action" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "Nintendo Switch" } },
        { platform: { name: "PlayStation 4" } }
      ],
      description_raw: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs."
    },
    {
      name: "Dark Souls III",
      rating: 4.5,
      metacritic: 89,
      released: "2016-04-12",
      background_image: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=800",
      genres: [{ name: "Action RPG", slug: "role-playing-games-rpg" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 4" } },
        { platform: { name: "Xbox One" } }
      ],
      description_raw: "As fires fade and the world falls into ruin, developer FROMSOFTWARE and director Hidetaka Miyazaki continue their critically celebrated and genre-defining series with Dark Souls III."
    },
    {
      name: "Hades",
      rating: 4.7,
      metacritic: 93,
      released: "2020-09-17",
      background_image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800",
      genres: [{ name: "Roguelike", slug: "role-playing-games-rpg" }, { name: "Indie", slug: "indie" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "Nintendo Switch" } },
        { platform: { name: "PlayStation 5" } }
      ],
      description_raw: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion and Transistor."
    },
    {
      name: "Sekiro: Shadows Die Twice",
      rating: 4.6,
      metacritic: 91,
      released: "2019-03-22",
      background_image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800",
      genres: [{ name: "Action", slug: "action" }, { name: "Adventure", slug: "adventure" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 4" } },
        { platform: { name: "Xbox One" } }
      ],
      description_raw: "Carve your own clever path to vengeance in an all-new adventure from FromSoftware, developers of the Dark Souls series. In Sekiro: Shadows Die Twice you are the 'one-armed wolf'."
    },
    {
      name: "Persona 5 Royal",
      rating: 4.8,
      metacritic: 95,
      released: "2020-03-31",
      background_image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800",
      genres: [{ name: "JRPG", slug: "role-playing-games-rpg" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "PlayStation 5" } },
        { platform: { name: "Nintendo Switch" } }
      ],
      description_raw: "Don the mask of Joker and join the Phantom Thieves of Hearts. Break free from the chains of modern society and stage grand heists, infiltrate the minds of the corrupt, and make them change their ways!"
    },
    {
      name: "Celeste",
      rating: 4.7,
      metacritic: 94,
      released: "2018-01-25",
      background_image: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800",
      genres: [{ name: "Platformer", slug: "platformer" }, { name: "Indie", slug: "indie" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "Nintendo Switch" } },
        { platform: { name: "PlayStation 4" } }
      ],
      description_raw: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight platformer from the creators of TowerFall. Brave hundreds of hand-crafted challenges."
    },
    {
      name: "Disco Elysium",
      rating: 4.9,
      metacritic: 97,
      released: "2019-10-15",
      background_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
      genres: [{ name: "RPG", slug: "role-playing-games-rpg" }],
      platforms: [
        { platform: { name: "PC" } },
        { platform: { name: "Nintendo Switch" } },
        { platform: { name: "PlayStation 4" } }
      ],
      description_raw: "A groundbreaking role-playing game with unprecedented freedom of choice. Intimidate, sweet-talk, resort to violence, write poetry, be a disaster, or solve the mystery of your own identity."
    }
  ];

  /* ── Transform fallback to look like RAWG response ── */
  function getFallbackGames(limit = 12) {
    const sliced = FALLBACK_GAMES.slice(0, limit);
    return {
      results: sliced,
      count: FALLBACK_GAMES.length,
      _isFallback: true
    };
  }

  /* ── Cache Manager ── */
  function getCached(key) {
    try {
      const cached = localStorage.getItem(`nv_${key}`);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(`nv_${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(`nv_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch { /* storage full, ignore */ }
  }

  /* ── Generic Fetch with Retry ── */
  async function fetchWithRetry(url, retries = 2) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 2000 * (i + 1)));
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  /* ── Jikan API (Anime) ── */
  async function getTopAnime(limit = 6) {
    const cacheKey = `top_anime_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await fetchWithRetry(`${JIKAN_BASE}/top/anime?limit=${limit}`);
    setCache(cacheKey, data);
    return data;
  }

  async function getAnimePage(page = 1, limit = 24) {
    const cacheKey = `anime_page_${page}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await fetchWithRetry(`${JIKAN_BASE}/top/anime?page=${page}&limit=${limit}`);
    setCache(cacheKey, data);
    return data;
  }

  async function getSeasonalAnime(limit = 18) {
    const cacheKey = `seasonal_anime_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await fetchWithRetry(`${JIKAN_BASE}/seasons/now?limit=${limit}`);
    setCache(cacheKey, data);
    return data;
  }

  async function searchAnime(query) {
    const data = await fetchWithRetry(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=8`);
    return data;
  }

  /* ═══════════════════════════════════════════════════
     RAWG API (Games) — with automatic fallback
     ═══════════════════════════════════════════════════ */
  async function getTopGames(pageSize = 6) {
    const cacheKey = `top_games_${pageSize}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // Try RAWG API (with key)
    try {
      const data = await fetchWithRetry(
        `${RAWG_BASE}?key=${RAWG_KEY}&ordering=-rating&page_size=${pageSize}`
      );
      if (data && data.results && data.results.length > 0 && data.results[0].background_image) {
        setCache(cacheKey, data);
        return data;
      }
      throw new Error('Empty or invalid RAWG response');
    } catch (err) {
      console.warn('[NEONVERSE] RAWG API failed, using fallback games:', err.message);
      const fallback = getFallbackGames(pageSize);
      return fallback;
    }
  }

  async function getGamesPage(page = 1, pageSize = 20) {
    const cacheKey = `games_page_${page}_${pageSize}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // Page 1 or fallback for any page
    if (page === 1) {
      try {
        const data = await fetchWithRetry(
          `${RAWG_BASE}?key=${RAWG_KEY}&ordering=-rating&page=${page}&page_size=${pageSize}`
        );
        if (data && data.results && data.results.length > 0 && data.results[0].background_image) {
          setCache(cacheKey, data);
          return data;
        }
        throw new Error('Empty or invalid RAWG response');
      } catch (err) {
        console.warn('[NEONVERSE] RAWG API failed, using fallback games:', err.message);
        const fallback = getFallbackGames(pageSize);
        return fallback;
      }
    }

    // For page > 1, repeat fallback with offset shuffle
    const shuffled = [...FALLBACK_GAMES].sort(() => Math.random() - 0.5);
    return {
      results: shuffled.slice(0, Math.min(pageSize, FALLBACK_GAMES.length)),
      count: FALLBACK_GAMES.length,
      _isFallback: true
    };
  }

  /* ── Genre Mapping ── */
  const animeGenres = {
    'Action': 1, 'Adventure': 2, 'Comedy': 4, 'Drama': 8,
    'Fantasy': 10, 'Horror': 14, 'Mecha': 18, 'Romance': 22,
    'Shonen': 27, 'Seinen': 42, 'Isekai': 62
  };

  const gameGenres = {
    'Action': 'action', 'RPG': 'role-playing-games-rpg',
    'FPS': 'shooter', 'Strategy': 'strategy',
    'Sports': 'sports', 'Adventure': 'adventure',
    'Indie': 'indie', 'Horror': 'horror'
  };

  return {
    getTopAnime,
    getAnimePage,
    getSeasonalAnime,
    searchAnime,
    getTopGames,
    getGamesPage,
    getFallbackGames,
    FALLBACK_GAMES,
    animeGenres,
    gameGenres,
    getCached,
    setCache
  };
})();
