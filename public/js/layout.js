class SimpleLayoutManager {
  static async loadComponent(elementId, componentPath) {
    try {
      console.log(`開始載入: ${componentPath}`);
      const response = await fetch(componentPath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const container = document.getElementById(elementId);

      if (!container) {
        console.error(`找不到容器元素: ${elementId}`);
        return;
      }

      // 創建臨時容器來解析 HTML
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // 移除 script 標籤（避免重複執行）
      const scripts = temp.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // 移除搜尋視窗（因為已經在主頁面中）
      const searchBar = temp.querySelector("#search");
      if (searchBar) searchBar.remove();

      // 插入處理後的 HTML
      container.innerHTML = temp.innerHTML;

      console.log(`✅ 成功載入: ${componentPath}`);

      // 如果是 header，綁定搜尋按鈕事件
      if (elementId === "header-container") {
        this.bindSearchButton();
      }
    } catch (error) {
      console.error(`❌ 載入組件失敗: ${componentPath}`, error);

      // 如果載入失敗，插入基本的 header
      if (elementId === "header-container") {
        this.insertFallbackHeader();
      }
    }
  }

  static bindSearchButton() {
    console.log("綁定搜尋按鈕事件");
    const searchButtons = document.querySelectorAll(".search-button");
    searchButtons.forEach((button) => {
      button.removeEventListener("click", this.searchButtonHandler);
      button.addEventListener("click", this.searchButtonHandler);
    });
  }

  static searchButtonHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("搜尋按鈕被點擊");
    openSearchBar();
  }

  static insertFallbackHeader() {
    console.log("插入備用 header");
    const container = document.getElementById("header-container");
    if (container) {
      container.innerHTML = `
                        <nav class="navbar navbar-expand-lg p-3 border-bottom" style="background-color: #efe8dd; position: fixed; top: 0; left: 0; width: 100%; z-index: 1030;">
                            <div class="container-fluid">
                                <a class="navbar-brand" href="index.html">
                                    <img src="./images/main-logo.png" alt="網站 Logo" height="60" onerror="this.style.display='none'">
                                    <span>您的網站</span>
                                </a>
                                <button type="button" class="search-button border-0 bg-transparent" onclick="openSearchBar()">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 7-7a7 7 0 0 1-7 7Z"/>
                                    </svg>
                                </button>
                            </div>
                        </nav>
                    `;
    }
  }

  static async init() {
    console.log("開始初始化頁面組件...");

    // 嘗試載入 header
    await this.loadComponent("header-container", "./components/header.html");

    // 嘗試載入 footer
    await this.loadComponent("footer-container", "./components/footer.html");

    console.log("組件載入流程完成");

    // 驗證元素
    const searchBar = document.getElementById("search");
    const searchButtons = document.querySelectorAll(".search-button");

    console.log("搜尋視窗:", searchBar ? "✅ 找到" : "❌ 未找到");
    console.log("搜尋按鈕數量:", searchButtons.length);
  }
}

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM 載入完成");
  SimpleLayoutManager.init();
});
