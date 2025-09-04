# JADE 時尚電商平台

> 全台最大的線上時尚購物平台，基於 Vue.js 3 開發

## 🌟 功能特色

- **響應式設計** - 完美支援桌面、平板、手機
- **現代化 UI** - 使用 Bootstrap 5 + 自訂樣式
- **廣告輪播** - 動態廣告管理系統
- **商品展示** - 新品上市、熱銷商品展示
- **搜尋功能** - 全站商品搜尋
- **購物車** - 完整的購物流程
- **會員系統** - 登入註冊功能
- **API 整合** - 與後端 .NET Core API 完整整合

## 🚀 技術棧

- **Vue.js 3** - 漸進式 JavaScript 框架
- **Vue Router 4** - 單頁應用路由
- **Bootstrap 5** - CSS 框架
- **Sass/SCSS** - CSS 預處理器
- **Axios** - HTTP 客戶端
- **Vue CLI** - 開發工具鏈

## 📁 項目結構

```
jade-ecommerce/
├── public/                 # 靜態資源
│   ├── index.html         # HTML 模板
│   └── images/            # 圖片資源
├── src/
│   ├── components/        # Vue 組件
│   │   ├── AppHeader.vue  # 頭部導航
│   │   └── AppFooter.vue  # 底部組件
│   ├── views/             # 頁面組件
│   │   ├── HomeView.vue   # 首頁
│   │   ├── ProductsView.vue
│   │   └── ...
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── styles/            # 樣式文件
│   │   ├── variables.scss
│   │   └── mixins.scss
│   ├── utils/             # 工具函數
│   ├── App.vue            # 根組件
│   └── main.js            # 入口文件
├── package.json           # 依賴配置
├── vue.config.js          # Vue CLI 配置
└── README.md             # 說明文件
```

## 🛠️ 安裝與運行

### 環境要求

- Node.js 16+ 
- npm 或 yarn

### 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 開發環境運行

```bash
# 啟動開發服務器
npm run serve

# 或
yarn serve
```

應用將在 `http://localhost:8080` 運行

### 生產環境構建

```bash
# 構建生產版本
npm run build

# 或
yarn build
```

### 代碼檢查

```bash
# ESLint 檢查
npm run lint

# 或
yarn lint
```

## 🔧 配置說明

### API 配置

後端 API 服務器地址在以下文件中配置：

- `src/views/HomeView.vue` - API_BASE_URL
- `vue.config.js` - 開發環境代理配置

### 環境變量

創建 `.env` 文件：

```env
VUE_APP_API_BASE_URL=https://localhost:7106
VUE_APP_TITLE=JADE 時尚電商
```

## 📱 響應式斷點

- **手機** - < 576px
- **平板** - 576px - 768px  
- **桌面** - 768px - 1200px
- **大屏** - > 1200px

## 🎨 樣式指南

### 色彩設計

- **主色調**: `#efe8dd` (米白色)
- **強調色**: `#ff3131` (紅色)
- **文字色**: `#333` (深灰)
- **邊框色**: `#f0f0f0` (淺灰)

### 字體

- **主字體**: Arial, sans-serif
- **標題**: 大寫字母, 粗體
- **內文**: 正常權重

## 🔌 API 整合

### 廣告 API

```javascript
// 取得首頁廣告
GET /api/banners/homepage

// 記錄廣告點擊
POST /api/banners/{id}/click
```

### 商品 API

```javascript
// 取得商品列表
GET /api/products

// 取得商品詳情
GET /api/products/{id}

// 搜尋商品
GET /api/products/search?q={keyword}
```

## 🚢 部署

### 使用 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass https://your-api-server.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 使用 Docker

```dockerfile
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 測試

```bash
# 單元測試
npm run test:unit

# E2E 測試
npm run test:e2e
```

## 📄 授權

MIT License

## 👥 開發團隊

- **前端開發**: JADE 開發團隊
- **UI/UX 設計**: JADE 設計團隊
- **後端 API**: .NET Core 團隊

## 🤝 貢獻指南

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📞 聯絡我們

- **Email**: tainanjade@gmail.com
- **電話**: +43 720 11 52 78
- **網站**: https://jade-taiwan.com

## 🔄 更新日誌

### v1.0.0 (2025-01-01)
- 初始版本發布
- 首頁功能完成
- 響應式設計實現
- API 整合完成

---

**Made with ❤️ by JADE Team**