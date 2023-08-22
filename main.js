import config from "./config.js";

let news = [];
let url;
let page = 1;
let totalPage = 0;
const menus = document.querySelectorAll(".menus button");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const headLine = document.querySelector(".head-line svg");
const API_KEY = config.API_KEY;

menus.forEach((menu) =>
  menu.addEventListener("click", (event) => getNewsByCategory(event))
);

const getNews = async () => {
  try {
    const header = new Headers({
      "X-Api-Key": API_KEY,
    });
    url.searchParams.set("page", page);
    const response = await fetch(url, { headers: header });
    const data = await response.json();
    if (response.status === 200) {
      if (data.articles === undefined && data.sources.length === 0) {
        throw new Error("검색된 결과값이 없습니다.");
      }
      console.log(data);
      news = data.articles;
      totalPage = data.totalResults;
      //   page = data.page;
      render();
      pagination();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    errorRender(error.message);
  }
};

const getLatestNews = async () => {
  page = 1;
  url = new URL(`https://newsapi.org/v2/top-headlines?country=kr&pageSize=5`);
  getNews();
};

const getNewsByCategory = async (event) => {
  const category = event.target.innerText.toLowerCase();
  page = 1;
  url = new URL(
    `https://newsapi.org/v2/top-headlines?country=kr&pageSize=5&category=${category}`
  );
  getNews();
};

const getNewsByKeyword = async () => {
  const keyword = searchInput.value;
  page = 1;
  url = new URL(
    `https://newsapi.org/v2/top-headlines/sources?q=${keyword}&country=kr&pageSize=5`
  );
  getNews();
};

const render = () => {
  let newsHTML = "";
  newsHTML = news
    .map((news) => {
      return `<div class="row news">
    <div class="col-lg-4">
      <img class="news-img-size" src="${
        news.urlToImage || "./images/no-image.png"
      }" alt="Image" />
    </div>
    <div class="col-lg-8">
      <h2>
        <a href="${news.url}">
        ${news.title}
        </a>
      </h2>
      <p>${news.description || "내용없음"}</p>
      <div>${news.source.name || "no source"} * ${
        news.author || "no author"
      } * ${news.publishedAt}</div>
    </div>
  </div>`;
    })
    .join(" ");

  document.getElementById("news-board").innerHTML = newsHTML;
};

const errorRender = (message) => {
  let errorHTML = `<div class="alert alert-danger text-center" role="alert">${message}</div>`;
  document.getElementById("news-board").innerHTML = errorHTML;
};

const pagination = () => {
  let paginationHTML = ``;
  let pageGroup = Math.ceil(page / 5);
  let last = pageGroup * 5;
  if (last > totalPage) {
    last = totalPage;
  }
  let first = last - 4 <= 0 ? 1 : last - 4;

  if (first >= 6) {
    paginationHTML = `<li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${1})"><span aria-hidden="true">&lt;&lt;</span></a>
        </li>
        <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${
          page - 1
        })"><span aria-hidden="true">&lt;</span></a>
        </li>`;
  }

  console.log(first, last, page, pageGroup, totalPage);

  if (last * 5 > totalPage) {
    last = Math.ceil(totalPage / 5);
  }

  for (let i = first; i <= last; i++) {
    paginationHTML += `<li class="page-item ${
      page === i ? "active" : ""
    }"><a class="page-link" href="#" onclick="moveToPage(${i})">${i}</a></li>`;
  }
  if (last * 5 < totalPage) {
    paginationHTML += `<li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${
        page + 1
      })">
      <span aria-hidden="true">&gt;</span>
      </a>
      </li>
      <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${Math.ceil(
        totalPage / 5
      )})">
      <span aria-hidden="true">&gt;&gt;</span>
      </a>
      </li>`;
  }

  document.querySelector(".pagination").innerHTML = paginationHTML;
};

const moveToPage = (pageNum) => {
  page = pageNum;
  window.scrollTo({ top: 0, behavior: "smooth" });
  getNews();
};

headLine.addEventListener("click", getLatestNews);
searchButton.addEventListener("click", getNewsByKeyword);
getLatestNews();
