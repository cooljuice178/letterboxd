const listMeta = {
  top500: {
    label: "Top 500",
    title: "Letterboxd Top 500",
    note:
      "Letterboxd 官方 Top 500 榜单。当前数据文件先放入种子条目，后续可扩展到完整 500 部。",
  },
  mostFans: {
    label: "Most Fans",
    title: "Most Fans on Letterboxd",
    note:
      "Letterboxd 粉丝最多电影榜。字段支持 fans 与 watched；页面默认显示 watched。",
  },
  millionWatched: {
    label: "One Million Watched",
    title: "One Million Watched Club",
    note:
      "观看人数超过一百万的电影集合。适合按观看人数排序和补全豆瓣入口。",
  },
};

const state = {
  movies: [],
  activeList: "top500",
  query: "",
};

const grid = document.querySelector("#movie-grid");
const template = document.querySelector("#movie-card-template");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");

function formatCount(value) {
  if (!value) return "Watched --";
  if (value >= 1_000_000) return `Watched ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Watched ${Math.round(value / 1_000)}K`;
  return `Watched ${value}`;
}

function formatSecondaryMetric(movie, entry) {
  if (movie.watched) return formatCount(movie.watched);
  if (state.activeList === "millionWatched") return "Watched 1M+";
  if (state.activeList === "mostFans") return `Fan rank #${entry.rank}`;
  return `Rank #${entry.rank}`;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function getListEntry(movie, listKey) {
  return movie.lists.find((entry) => entry.key === listKey);
}

function renderSummary(items) {
  const meta = listMeta[state.activeList];
  document.querySelector("#list-label").textContent = meta.label;
  document.querySelector("#list-title").textContent = `${meta.title} (${items.length})`;
  document.querySelector("#list-note").textContent = meta.note;

  const unique = new Set(state.movies.map((movie) => movie.id));
  const matched = state.movies.filter((movie) => movie.doubanUrl).length;
  document.querySelector("#total-count").textContent = unique.size;
  document.querySelector("#matched-count").textContent = matched;
}

function getFilteredMovies() {
  const query = normalize(state.query);
  return state.movies
    .filter((movie) => getListEntry(movie, state.activeList))
    .filter((movie) => {
      if (!query) return true;
      return [movie.title, movie.chineseTitle, movie.year, movie.director]
        .map(normalize)
        .some((field) => field.includes(query));
    })
    .sort((a, b) => getListEntry(a, state.activeList).rank - getListEntry(b, state.activeList).rank);
}

function renderMovies() {
  const items = getFilteredMovies();
  grid.replaceChildren();
  renderSummary(items);
  emptyState.hidden = items.length > 0;

  for (const movie of items) {
    const entry = getListEntry(movie, state.activeList);
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".movie-card");
    const posterLink = node.querySelector(".poster-link");
    const poster = node.querySelector(".poster");
    const title = node.querySelector("h3");
    const douban = node.querySelector(".douban");
    const letterboxd = node.querySelector(".letterboxd");

    card.dataset.id = movie.id;
    posterLink.href = movie.doubanUrl || movie.letterboxdUrl;
    poster.src = movie.poster;
    poster.alt = `${movie.title} poster`;
    node.querySelector(".rank").textContent = `#${entry.rank}`;
    title.textContent = movie.title;
    title.title = movie.title;
    node.querySelector(".year").textContent = movie.year;
    node.querySelector(".cn-title").textContent = movie.chineseTitle || "中文名待补";
    node.querySelector(".rating").textContent = movie.rating ? `LB ${movie.rating.toFixed(2)}` : "LB --";
    node.querySelector(".watched").textContent = formatSecondaryMetric(movie, entry);

    douban.href = movie.doubanUrl || `https://www.douban.com/search?q=${encodeURIComponent(movie.title)}`;
    letterboxd.href = movie.letterboxdUrl;
    if (!movie.doubanUrl) douban.textContent = "搜豆瓣";

    grid.append(node);
  }
}

function bindControls() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeList = tab.dataset.list;
      document.querySelectorAll(".tab").forEach((item) => {
        item.classList.toggle("is-active", item === tab);
      });
      renderMovies();
    });
  });

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderMovies();
  });
}

async function init() {
  const response = await fetch("./data/movies.json");
  state.movies = await response.json();
  bindControls();
  renderMovies();
}

init().catch((error) => {
  grid.innerHTML = `<p class="empty-state">Failed to load movie data: ${error.message}</p>`;
});
