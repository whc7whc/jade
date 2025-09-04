<template>
  <div class="seller-center">
    <!-- 載入中遮罩 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>載入中...</span>
      </div>
    </div>

    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <i class="fas fa-store"></i>
          <div>
            <h1>賣家資訊</h1>
      
          </div>
        </div>
        <div class="status-badge" :class="sellerInfo.status">
          <i class="fas fa-check-circle" v-if="sellerInfo.status === 'approved'"></i>
          <span>{{ getStatusText(sellerInfo.status) }}</span>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="main-content">
      <!-- 左側導航 -->
      <div class="sidebar">
        <nav class="nav-menu">
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <i class="fas fa-user"></i>
            <span>基本資料</span>
          </div>
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'bank' }"
            @click="activeTab = 'bank'"
          >
            <i class="fas fa-university"></i>
            <span>銀行資訊</span>
          </div>
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'address' }"
            @click="activeTab = 'address'"
          >
            <i class="fas fa-map-marker-alt"></i>
            <span>退貨地址</span>
          </div>
        </nav>
      </div>

      <!-- 右側內容區 -->
      <div class="content-area">
        
        <!-- 基本資料頁面 -->
        <div class="tab-content" v-if="activeTab === 'profile'">
          <div class="section-header">
            <h2><i class="fas fa-user"></i> 基本資料</h2>
            <p>您的基本賣家資訊</p>
          </div>
          
          <div class="info-card">
            <div class="info-row">
              <label>真實姓名</label>
              <span>{{ sellerInfo.realName }}</span>
            </div>
            <div class="info-row">
              <label>身分證號</label>
              <span>{{ maskIdNumber(sellerInfo.idNumber) }}</span>
            </div>
            <div class="info-row">
              <label>申請時間</label>
              <span>{{ formatDate(sellerInfo.appliedAt) }}</span>
            </div>
            <div class="info-row">
              <label>審核狀態</label>
              <span class="status-tag" :class="sellerInfo.status">
                {{ getStatusText(sellerInfo.status) }}
              </span>
            </div>
          </div>

          <div class="info-note">
            <i class="fas fa-info-circle"></i>
            <span>基本資料為身分驗證資訊，如需變更請聯繫客服人員。</span>
          </div>
        </div>

        <!-- 銀行資訊頁面 -->
        <div class="tab-content" v-if="activeTab === 'bank'">
          <div class="section-header">
            <h2><i class="fas fa-university"></i> 銀行資訊</h2>
            <p>管理您的收款銀行帳戶</p>
          </div>

          <div class="bank-card">
            <div class="bank-info" v-if="!editingBank">
              <div class="bank-header">
                <div class="bank-icon">
                  <i class="fas fa-university"></i>
                </div>
                <div class="bank-details">
                  <h3>{{ sellerInfo.bankName }}</h3>
                  <p>{{ sellerInfo.accountNumber }}</p>
                  <span class="account-name">{{ sellerInfo.accountName }}</span>
                </div>
                <button class="btn-edit" @click="startEditBank">
                  <i class="fas fa-edit"></i>
                  編輯
                </button>
              </div>
              
              <div class="bank-meta">
                <div class="meta-item">
                  <label>銀行代碼</label>
                  <span>{{ sellerInfo.bankCode }}</span>
                </div>
                <div class="meta-item">
                  <label>更新時間</label>
                  <span>{{ formatDate(sellerInfo.updatedAt) }}</span>
                </div>
              </div>
            </div>

            <!-- 編輯銀行資訊表單 -->
            <form @submit.prevent="updateBankInfo" v-if="editingBank" class="edit-form">
              <div class="form-grid">
                <div class="input-field">
                  <i class="fas fa-university"></i>
                  <select v-model="bankForm.bankName" @change="onBankChange" required>
<option value="">請選擇銀行 *</option>
<option value="台灣銀行">台灣銀行</option>
<option value="土地銀行">土地銀行</option>
<option value="合作金庫">合作金庫</option>
<option value="第一銀行">第一銀行</option>
<option value="華南銀行">華南銀行</option>
<option value="彰化銀行">彰化銀行</option>
<option value="上海銀行">上海銀行</option>
<option value="台北富邦">台北富邦</option>
<option value="國泰世華">國泰世華</option>
<option value="中國輸出入銀行">中國輸出入銀行</option>
<option value="高雄銀行">高雄銀行</option>
<option value="兆豐銀行">兆豐銀行</option>
<option value="花旗銀行">花旗銀行</option>
<option value="王道銀行">王道銀行</option>
<option value="台灣中小企業銀行">台灣中小企業銀行</option>
<option value="渣打銀行">渣打銀行</option>
<option value="台中銀行">台中銀行</option>
<option value="京城銀行">京城銀行</option>
<option value="滙豐銀行">滙豐銀行</option>
<option value="瑞興銀行">瑞興銀行</option>
<option value="華泰銀行">華泰銀行</option>
<option value="新光銀行">新光銀行</option>
<option value="陽信銀行">陽信銀行</option>
<option value="板信銀行">板信銀行</option>
<option value="三信銀行">三信銀行</option>
<option value="聯邦銀行">聯邦銀行</option>
<option value="遠東銀行">遠東銀行</option>
<option value="元大銀行">元大銀行</option>
<option value="永豐銀行">永豐銀行</option>
<option value="玉山銀行">玉山銀行</option>
<option value="凱基銀行">凱基銀行</option>
<option value="星展銀行">星展銀行</option>
<option value="台新銀行">台新銀行</option>
<option value="安泰銀行">安泰銀行</option>
<option value="中國信託">中國信託</option>
<option value="將來銀行">將來銀行</option>
<option value="連線商銀">連線商銀</option>
<option value="樂天銀行">樂天銀行</option>
<option value="中華郵政">中華郵政</option>
<option value="其他">其他</option>
                  </select>
                </div>

                <div class="input-field" v-if="bankForm.bankName === '其他'">
                  <i class="fas fa-code"></i>
                  <input
                    type="text"
                    placeholder="請輸入銀行代碼"
                    v-model="bankForm.bankCode"
                    required
                  />
                </div>

                <div class="input-field">
                  <i class="fas fa-credit-card"></i>
                  <input 
                    type="text" 
                    placeholder="銀行帳號" 
                    v-model="bankForm.accountNumber"
                    required
                  >
                </div>

                <div class="input-field">
                  <i class="fas fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="帳戶名稱" 
                    v-model="bankForm.accountName"
                    required
                  >
                </div>
              </div>

              <div class="upload-section">
                <label class="upload-label" :class="{ 'has-file': bankForm.bankPhoto }">
                  <div class="upload-content">
                    <i class="fas fa-camera"></i>
                    <span>更新存摺照片</span>
                    <p class="upload-hint">請上傳存摺封面或內頁含帳號的照片</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleBankPhotoUpload"
                  >
                  <div class="upload-preview" v-if="bankForm.bankPhotoPreview">
                    <img :src="bankForm.bankPhotoPreview" alt="存摺照片">
                    <div class="file-name">{{ bankForm.bankPhoto?.name }}</div>
                  </div>
                </label>
              </div>

              <div class="form-actions">
                <button type="button" class="btn outline" @click="cancelEditBank">取消</button>
                <button type="submit" class="btn solid" :disabled="isUpdating">
                  <i class="fas fa-save" v-if="!isUpdating"></i>
                  <i class="fas fa-spinner fa-spin" v-if="isUpdating"></i>
                  {{ isUpdating ? '更新中...' : '儲存變更' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 退貨地址頁面 -->
        <div class="tab-content" v-if="activeTab === 'address'">
          <div class="section-header">
            <h2><i class="fas fa-map-marker-alt"></i> 退貨地址</h2>
            <p>管理商品退貨的收件地址</p>
          </div>

          <div class="address-card">
            <div class="address-info" v-if="!editingAddress">
              <div class="address-header">
                <div class="address-icon">
                  <i class="fas fa-home"></i>
                </div>
                <div class="address-details">
                  <h3>{{ sellerInfo.contactName }}</h3>
                  <p>{{ sellerInfo.contactPhone }}</p>
                  <div class="full-address">
                    {{ sellerInfo.city }}{{ sellerInfo.district }} {{ sellerInfo.returnAddress }}
                    <span class="zipcode">({{ sellerInfo.zipCode }})</span>
                  </div>
                </div>
                <button class="btn-edit" @click="startEditAddress">
                  <i class="fas fa-edit"></i>
                  編輯
                </button>
              </div>
            </div>

            <!-- 編輯地址表單 -->
            <form @submit.prevent="updateAddressInfo" v-if="editingAddress" class="edit-form">
              <div class="form-grid">
                <div class="input-field">
                  <i class="fas fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="收件人姓名" 
                    v-model="addressForm.contactName"
                    required
                  >
                </div>
                
                <div class="input-field">
                  <i class="fas fa-phone"></i>
                  <input 
                    type="tel" 
                    placeholder="聯絡電話" 
                    v-model="addressForm.contactPhone"
                    required
                  >
                </div>
              </div>

              <div class="address-row">
                <div class="input-field">
                  <i class="fas fa-map-marker-alt"></i>
                  <select v-model="addressForm.city" @change="onCityChange" required>
                    <option value="">選擇縣市</option>
                    <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
                  </select>
                </div>
                
                <div class="input-field">
                  <i class="fas fa-map"></i>
                  <select v-model="addressForm.district" @change="onDistrictChange" required>
                    <option value="">選擇區域</option>
                    <option v-for="district in availableDistricts" :key="district.name" :value="district.name">{{ district.name }}</option>
                  </select>
                </div>
                
                <div class="input-field">
                  <i class="fas fa-hashtag"></i>
                  <input 
                    type="text" 
                    placeholder="郵遞區號" 
                    v-model="addressForm.zipCode"
                    required
                    readonly
                  >
                </div>
              </div>
              
              <div class="input-field">
                <i class="fas fa-home"></i>
                <textarea 
                  placeholder="詳細地址" 
                  v-model="addressForm.returnAddress"
                  required
                  rows="3"
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="button" class="btn outline" @click="cancelEditAddress">取消</button>
                <button type="submit" class="btn solid" :disabled="isUpdating">
                  <i class="fas fa-save" v-if="!isUpdating"></i>
                  <i class="fas fa-spinner fa-spin" v-if="isUpdating"></i>
                  {{ isUpdating ? '更新中...' : '儲存變更' }}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineOptions } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

// 定義組件名稱為多詞以符合 ESLint 規範
defineOptions({
  name: 'SellerInformation'
})

const router = useRouter()
const store = useStore()

// 設定 axios 預設 baseURL
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app'

// 響應式資料
const isLoading = ref(true)
const isUpdating = ref(false)
const activeTab = ref('profile')
const editingBank = ref(false)
const editingAddress = ref(false)

// 賣家資訊
const sellerInfo = ref({
  realName: '',
  idNumber: '',
  bankName: '',
  bankCode: '',
  accountNumber: '',
  accountName: '',
  contactName: '',
  contactPhone: '',
  city: '',
  district: '',
  zipCode: '',
  returnAddress: '',
  status: 'approved',
  appliedAt: '',
  updatedAt: ''
})

// 銀行表單
const bankForm = reactive({
  bankName: '',
  bankCode: '',
  accountNumber: '',
  accountName: '',
  bankPhoto: null,
  bankPhotoPreview: ''
})

// 地址表單
const addressForm = reactive({
  contactName: '',
  contactPhone: '',
  city: '',
  district: '',
  zipCode: '',
  returnAddress: ''
})

// 銀行代碼映射
const bankCodeMap = {
  '台灣銀行': '004',
  '土地銀行': '005',
  '合作金庫': '006',
  '第一銀行': '007',
  '華南銀行': '008',
  '彰化銀行': '009',
  '上海銀行': '011',
  '台北富邦': '012',
  '國泰世華': '013',
  '中國輸出入銀行': '015',
  '高雄銀行': '016',
  '兆豐銀行': '017',
  '花旗銀行': '021',
  '王道銀行': '048',
  '台灣中小企業銀行': '050',
  '渣打銀行': '052',
  '台中銀行': '053',
  '京城銀行': '054',
  '滙豐銀行': '081',
  '瑞興銀行': '101',
  '華泰銀行': '102',
  '新光銀行': '103',
  '陽信銀行': '108',
  '板信銀行': '118',
  '三信銀行': '147',
  '聯邦銀行': '803',
  '遠東銀行': '805',
  '元大銀行': '806',
  '永豐銀行': '807',
  '玉山銀行': '808',
  '凱基銀行': '809',
  '星展銀行': '810',
  '台新銀行': '812',
  '安泰銀行': '816',
  '中國信託': '822',
  '將來銀行': '823',
  '連線商銀': '824',
  '樂天銀行': '826',
  '中華郵政': '700'
};

// 城市資料（簡化版，實際應用中應該從 API 或完整資料獲取）
const cities = [
 {
    name: '台北市',
    districts: [
      { name: '中正區', zipCode: '100' },
      { name: '大同區', zipCode: '103' },
      { name: '中山區', zipCode: '104' },
      { name: '松山區', zipCode: '105' },
      { name: '大安區', zipCode: '106' },
      { name: '萬華區', zipCode: '108' },
      { name: '信義區', zipCode: '110' },
      { name: '士林區', zipCode: '111' },
      { name: '北投區', zipCode: '112' },
      { name: '內湖區', zipCode: '114' },
      { name: '南港區', zipCode: '115' },
      { name: '文山區', zipCode: '116' }
    ]
  },
  {
    name: '新北市',
    districts: [
      { name: '板橋區', zipCode: '220' },
      { name: '三重區', zipCode: '241' },
      { name: '中和區', zipCode: '235' },
      { name: '永和區', zipCode: '234' },
      { name: '新莊區', zipCode: '242' },
      { name: '新店區', zipCode: '231' },
      { name: '樹林區', zipCode: '238' },
      { name: '鶯歌區', zipCode: '239' },
      { name: '三峽區', zipCode: '237' },
      { name: '淡水區', zipCode: '251' },
      { name: '汐止區', zipCode: '221' },
      { name: '瑞芳區', zipCode: '224' },
      { name: '土城區', zipCode: '236' },
      { name: '蘆洲區', zipCode: '247' },
      { name: '五股區', zipCode: '248' },
      { name: '八里區', zipCode: '249' },
      { name: '林口區', zipCode: '244' }
    ]
  },
  {
    name: '基隆市',
    districts: [
      { name: '仁愛區', zipCode: '200' },
      { name: '信義區', zipCode: '201' },
      { name: '中正區', zipCode: '202' },
      { name: '中山區', zipCode: '203' },
      { name: '安樂區', zipCode: '204' },
      { name: '暖暖區', zipCode: '205' }
    ]
  },
  {
    name: '桃園市',
    districts: [
      { name: '桃園區', zipCode: '330' },
      { name: '中壢區', zipCode: '320' },
      { name: '平鎮區', zipCode: '324' },
      { name: '八德區', zipCode: '334' },
      { name: '楊梅區', zipCode: '326' },
      { name: '蘆竹區', zipCode: '338' },
      { name: '大溪區', zipCode: '335' },
      { name: '龍潭區', zipCode: '325' },
      { name: '龜山區', zipCode: '333' }
    ]
  },
  {
    name: '新竹市',
    districts: [
      { name: '東區', zipCode: '300' },
      { name: '北區', zipCode: '300' },
      { name: '香山區', zipCode: '300' }
    ]
  },
  {
    name: '新竹縣',
    districts: [
      { name: '竹北市', zipCode: '302' },
      { name: '湖口鄉', zipCode: '303' },
      { name: '新豐鄉', zipCode: '304' },
      { name: '新埔鎮', zipCode: '305' },
      { name: '關西鎮', zipCode: '306' },
      { name: '芎林鄉', zipCode: '307' },
      { name: '寶山鄉', zipCode: '308' },
      { name: '竹東鎮', zipCode: '310' },
      { name: '五峰鄉', zipCode: '311' },
      { name: '橫山鄉', zipCode: '312' },
      { name: '尖石鄉', zipCode: '313' },
      { name: '北埔鄉', zipCode: '314' },
      { name: '峨眉鄉', zipCode: '315' }
    ]
  },
  {
    name: '苗栗縣',
    districts: [
      { name: '苗栗市', zipCode: '360' },
      { name: '苑裡鎮', zipCode: '351' },
      { name: '通霄鎮', zipCode: '352' },
      { name: '竹南鎮', zipCode: '350' },
      { name: '後龍鎮', zipCode: '346' },
      { name: '卓蘭鎮', zipCode: '369' },
      { name: '造橋鄉', zipCode: '361' },
      { name: '西湖鄉', zipCode: '362' },
      { name: '頭份市', zipCode: '351' },
      { name: '三義鄉', zipCode: '367' },
      { name: '公館鄉', zipCode: '363' },
      { name: '銅鑼鄉', zipCode: '364' },
      { name: '三灣鄉', zipCode: '365' },
      { name: '獅潭鄉', zipCode: '366' }
    ]
  },
  {
    name: '台中市',
    districts: [
      { name: '中區', zipCode: '400' },
      { name: '東區', zipCode: '401' },
      { name: '南區', zipCode: '402' },
      { name: '西區', zipCode: '403' },
      { name: '北區', zipCode: '404' },
      { name: '北屯區', zipCode: '406' },
      { name: '西屯區', zipCode: '407' },
      { name: '南屯區', zipCode: '408' },
      { name: '太平區', zipCode: '411' },
      { name: '大里區', zipCode: '412' },
      { name: '霧峰區', zipCode: '413' },
      { name: '烏日區', zipCode: '414' },
      { name: '豐原區', zipCode: '420' },
      { name: '后里區', zipCode: '421' },
      { name: '石岡區', zipCode: '422' },
      { name: '東勢區', zipCode: '423' },
      { name: '和平區', zipCode: '424' },
      { name: '新社區', zipCode: '426' },
      { name: '潭子區', zipCode: '427' },
      { name: '大雅區', zipCode: '428' },
      { name: '神岡區', zipCode: '429' },
      { name: '大肚區', zipCode: '432' },
      { name: '沙鹿區', zipCode: '433' },
      { name: '龍井區', zipCode: '434' },
      { name: '梧棲區', zipCode: '435' },
      { name: '清水區', zipCode: '436' },
      { name: '大甲區', zipCode: '437' },
      { name: '外埔區', zipCode: '438' },
      { name: '大安區', zipCode: '439' }
    ]
  },
  {
    name: '彰化縣',
    districts: [
      { name: '彰化市', zipCode: '500' },
      { name: '員林市', zipCode: '510' },
      { name: '和美鎮', zipCode: '508' },
      { name: '鹿港鎮', zipCode: '505' },
      { name: '溪湖鎮', zipCode: '515' },
      { name: '二林鎮', zipCode: '520' },
      { name: '田中鎮', zipCode: '530' },
      { name: '北斗鎮', zipCode: '515' },
      { name: '花壇鄉', zipCode: '509' },
      { name: '芬園鄉', zipCode: '502' },
      { name: '秀水鄉', zipCode: '504' },
      { name: '伸港鄉', zipCode: '522' },
      { name: '福興鄉', zipCode: '521' },
      { name: '線西鄉', zipCode: '526' },
      { name: '和美鎮', zipCode: '508' },
      { name: '埔心鄉', zipCode: '523' },
      { name: '溪州鄉', zipCode: '524' },
      { name: '竹塘鄉', zipCode: '522' },
      { name: '大村鄉', zipCode: '516' },
      { name: '埔鹽鄉', zipCode: '515' },
      { name: '田尾鄉', zipCode: '522' },
      { name: '埤頭鄉', zipCode: '515' },
      { name: '芳苑鄉', zipCode: '523' },
      { name: '二水鄉', zipCode: '523' }
    ]
  },
  {
    name: '南投縣',
    districts: [
      { name: '南投市', zipCode: '540' },
      { name: '草屯鎮', zipCode: '542' },
      { name: '埔里鎮', zipCode: '545' },
      { name: '竹山鎮', zipCode: '557' },
      { name: '名間鄉', zipCode: '551' },
      { name: '集集鎮', zipCode: '552' },
      { name: '水里鄉', zipCode: '553' },
      { name: '魚池鄉', zipCode: '555' },
      { name: '國姓鄉', zipCode: '556' },
      { name: '仁愛鄉', zipCode: '542' }
    ]
  },
  {
    name: '雲林縣',
    districts: [
      { name: '斗六市', zipCode: '640' },
      { name: '斗南鎮', zipCode: '630' },
      { name: '虎尾鎮', zipCode: '632' },
      { name: '西螺鎮', zipCode: '648' },
      { name: '土庫鎮', zipCode: '633' },
      { name: '北港鎮', zipCode: '651' },
      { name: '古坑鄉', zipCode: '646' },
      { name: '莿桐鄉', zipCode: '646' },
      { name: '林內鄉', zipCode: '646' },
      { name: '二崙鄉', zipCode: '646' },
      { name: '崙背鄉', zipCode: '646' },
      { name: '大埤鄉', zipCode: '646' },
      { name: '水林鄉', zipCode: '646' },
      { name: '口湖鄉', zipCode: '646' },
      { name: '四湖鄉', zipCode: '646' },
      { name: '元長鄉', zipCode: '646' }
    ]
  },
  {
    name: '嘉義市',
    districts: [
      { name: '東區', zipCode: '600' },
      { name: '西區', zipCode: '600' }
    ]
  },
  {
    name: '嘉義縣',
    districts: [
      { name: '太保市', zipCode: '612' },
      { name: '朴子市', zipCode: '613' },
      { name: '布袋鎮', zipCode: '625' },
      { name: '大林鎮', zipCode: '622' },
      { name: '民雄鄉', zipCode: '621' },
      { name: '溪口鄉', zipCode: '622' },
      { name: '新港鄉', zipCode: '616' },
      { name: '六腳鄉', zipCode: '615' },
      { name: '東石鄉', zipCode: '625' },
      { name: '義竹鄉', zipCode: '612' },
      { name: '鹿草鄉', zipCode: '612' },
      { name: '水上鄉', zipCode: '612' }
    ]
  },
  {
    name: '台南市',
    districts: [
      { name: '中西區', zipCode: '700' },
      { name: '東區', zipCode: '701' },
      { name: '南區', zipCode: '702' },
      { name: '北區', zipCode: '704' },
      { name: '安平區', zipCode: '708' },
      { name: '安南區', zipCode: '709' },
      { name: '永康區', zipCode: '710' },
      { name: '歸仁區', zipCode: '711' },
      { name: '新化區', zipCode: '712' },
      { name: '新營區', zipCode: '730' },
      { name: '善化區', zipCode: '741' },
      { name: '新市區', zipCode: '744' },
      { name: '安定區', zipCode: '745' },
      { name: '麻豆區', zipCode: '721' },
      { name: '佳里區', zipCode: '722' },
      { name: '西港區', zipCode: '723' },
      { name: '七股區', zipCode: '724' },
      { name: '將軍區', zipCode: '725' },
      { name: '學甲區', zipCode: '726' },
      { name: '北門區', zipCode: '727' },
      { name: '新營區', zipCode: '730' },
      { name: '後壁區', zipCode: '731' },
      { name: '白河區', zipCode: '732' },
      { name: '東山區', zipCode: '733' },
      { name: '六甲區', zipCode: '734' },
      { name: '下營區', zipCode: '735' },
      { name: '柳營區', zipCode: '736' },
      { name: '鹽水區', zipCode: '737' },
      { name: '善化區', zipCode: '741' },
      { name: '大內區', zipCode: '742' },
      { name: '山上區', zipCode: '743' }
    ]
  },
  {
    name: '高雄市',
    districts: [
      { name: '新興區', zipCode: '800' },
      { name: '前金區', zipCode: '801' },
      { name: '苓雅區', zipCode: '802' },
      { name: '鹽埕區', zipCode: '803' },
      { name: '鼓山區', zipCode: '804' },
      { name: '旗津區', zipCode: '805' },
      { name: '前鎮區', zipCode: '806' },
      { name: '三民區', zipCode: '807' },
      { name: '楠梓區', zipCode: '811' },
      { name: '小港區', zipCode: '812' },
      { name: '左營區', zipCode: '813' },
      { name: '仁武區', zipCode: '814' },
      { name: '大社區', zipCode: '815' },
      { name: '岡山區', zipCode: '820' },
      { name: '路竹區', zipCode: '821' },
      { name: '阿蓮區', zipCode: '822' },
      { name: '田寮區', zipCode: '823' },
      { name: '燕巢區', zipCode: '824' },
      { name: '橋頭區', zipCode: '825' },
      { name: '梓官區', zipCode: '826' },
      { name: '彌陀區', zipCode: '827' },
      { name: '永安區', zipCode: '828' },
      { name: '湖內區', zipCode: '829' },
      { name: '茄萣區', zipCode: '830' },
      { name: '鳥松區', zipCode: '833' },
      { name: '大樹區', zipCode: '840' },
      { name: '旗山區', zipCode: '842' },
      { name: '美濃區', zipCode: '843' },
      { name: '六龜區', zipCode: '844' },
      { name: '內門區', zipCode: '845' },
      { name: '杉林區', zipCode: '846' },
      { name: '甲仙區', zipCode: '847' },
      { name: '桃源區', zipCode: '848' },
      { name: '那瑪夏區', zipCode: '849' },
      { name: '茂林區', zipCode: '851' },
      { name: '茄萣區', zipCode: '852' }
    ]
  },
  {
    name: '屏東縣',
    districts: [
      { name: '屏東市', zipCode: '900' },
      { name: '潮州鎮', zipCode: '922' },
      { name: '東港鎮', zipCode: '928' },
      { name: '恆春鎮', zipCode: '946' },
      { name: '萬丹鄉', zipCode: '923' },
      { name: '長治鄉', zipCode: '924' },
      { name: '麟洛鄉', zipCode: '925' },
      { name: '九如鄉', zipCode: '926' },
      { name: '里港鄉', zipCode: '927' },
      { name: '鹽埔鄉', zipCode: '929' },
      { name: '高樹鄉', zipCode: '931' },
      { name: '萬巒鄉', zipCode: '932' },
      { name: '內埔鄉', zipCode: '933' },
      { name: '竹田鄉', zipCode: '934' },
      { name: '新埤鄉', zipCode: '935' },
      { name: '枋寮鄉', zipCode: '936' },
      { name: '枋山鄉', zipCode: '937' },
      { name: '春日鄉', zipCode: '938' },
      { name: '獅子鄉', zipCode: '939' },
      { name: '車城鄉', zipCode: '940' },
      { name: '牡丹鄉', zipCode: '941' },
      { name: '滿州鄉', zipCode: '947' },
      { name: '琉球鄉（小琉球）', zipCode: '817' }
    ]
  },
  {
    name: '台東縣',
    districts: [
      { name: '台東市', zipCode: '950' },
      { name: '成功鎮', zipCode: '961' },
      { name: '關山鎮', zipCode: '962' },
      { name: '卑南鄉', zipCode: '963' },
      { name: '鹿野鄉', zipCode: '964' },
      { name: '池上鄉', zipCode: '965' },
      { name: '東河鄉', zipCode: '966' },
      { name: '長濱鄉', zipCode: '967' },
      { name: '太麻里鄉', zipCode: '968' },
      { name: '大武鄉', zipCode: '969' },
      { name: '綠島鄉', zipCode: '951' },
      { name: '蘭嶼鄉', zipCode: '972' }
    ]
  },
  {
    name: '花蓮縣',
    districts: [
      { name: '花蓮市', zipCode: '970' },
      { name: '鳳林鎮', zipCode: '971' },
      { name: '玉里鎮', zipCode: '973' },
      { name: '新城鄉', zipCode: '972' },
      { name: '吉安鄉', zipCode: '973' },
      { name: '壽豐鄉', zipCode: '974' },
      { name: '光復鄉', zipCode: '975' },
      { name: '豐濱鄉', zipCode: '976' },
      { name: '瑞穗鄉', zipCode: '977' },
      { name: '富里鄉', zipCode: '978' }
    ]
  },
  {
    name: '宜蘭縣',
    districts: [
      { name: '宜蘭市', zipCode: '260' },
      { name: '羅東鎮', zipCode: '265' },
      { name: '蘇澳鎮', zipCode: '270' },
      { name: '頭城鎮', zipCode: '261' },
      { name: '礁溪鄉', zipCode: '262' },
      { name: '壯圍鄉', zipCode: '263' },
      { name: '員山鄉', zipCode: '264' },
      { name: '冬山鄉', zipCode: '267' },
      { name: '五結鄉', zipCode: '268' },
      { name: '三星鄉', zipCode: '269' }
    ]
  },
  {
    name: '金門縣',
    districts: [
      { name: '金沙鎮', zipCode: '890' },
      { name: '金湖鎮', zipCode: '892' },
      { name: '金寧鄉', zipCode: '893' },
      { name: '金城鎮', zipCode: '891' },
      { name: '烈嶼鄉', zipCode: '894' }
    ]
  },
  {
    name: '連江縣',
    districts: [
      { name: '南竿鄉', zipCode: '209' },
      { name: '北竿鄉', zipCode: '210' },
      { name: '莒光鄉', zipCode: '211' },
      { name: '東引鄉', zipCode: '212' }
    ]
  },
  {
    name: '澎湖縣',
    districts: [
      { name: '馬公市', zipCode: '880' },
      { name: '湖西鄉', zipCode: '881' },
      { name: '白沙鄉', zipCode: '882' },
      { name: '西嶼鄉', zipCode: '883' },
      { name: '望安鄉', zipCode: '884' }
    ]
  }
]
  
  // 可以根據需要添加更多城市

// 計算可用的區域
const availableDistricts = computed(() => {
  const selectedCity = cities.find(city => city.name === addressForm.city)
  return selectedCity ? selectedCity.districts : []
})

// 載入賣家資訊
const loadSellerInfo = async () => {
  try {
    isLoading.value = true
    const memberId = localStorage.getItem('memberId')
    
    if (!memberId) {
      Swal.fire({
        icon: 'warning',
        title: '請先登入',
        confirmButtonText: '確定'
      })
      router.push('/login')
      return
    }

    const response = await axios.get(`/api/ApplySeller/${memberId}/seller-info`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    const data = response.data
    sellerInfo.value = {
      realName: data.realName || '',
      idNumber: data.idNumber || '',
      bankName: data.bankName || '',
      bankCode: data.bankCode || '',
      accountNumber: data.accountNumber || '',
      accountName: data.accountName || '',
      contactName: data.contactName || '',
      contactPhone: data.contactPhone || '',
      city: data.city || '',
      district: data.district || '',
      zipCode: data.zipCode || '',
      returnAddress: data.returnAddress || '',
      status: data.status || 'approved',
      appliedAt: data.appliedAt || '',
      updatedAt: data.updatedAt || new Date().toISOString()
    }

  } catch (error) {
    console.error('載入賣家資訊失敗:', error)
    if (error.response?.status === 404) {
      Swal.fire({
        icon: 'warning',
        title: '找不到賣家資訊',
        text: '請先完成賣家申請',
        confirmButtonText: '確定'
      }).then(() => {
        router.push('/apply-seller')
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: '載入失敗',
        text: '無法載入賣家資訊，請稍後再試',
        confirmButtonText: '確定'
      })
    }
  } finally {
    isLoading.value = false
  }
}

// 開始編輯銀行資訊
const startEditBank = () => {
  bankForm.bankName = sellerInfo.value.bankName
  bankForm.bankCode = sellerInfo.value.bankCode
  bankForm.accountNumber = sellerInfo.value.accountNumber
  bankForm.accountName = sellerInfo.value.accountName
  bankForm.bankPhoto = null
  bankForm.bankPhotoPreview = ''
  editingBank.value = true
}

// 取消編輯銀行資訊
const cancelEditBank = () => {
  editingBank.value = false
  Object.keys(bankForm).forEach(key => {
    if (key.endsWith('Preview')) {
      bankForm[key] = ''
    } else if (typeof bankForm[key] === 'string') {
      bankForm[key] = ''
    } else {
      bankForm[key] = null
    }
  })
}

// 銀行變更處理
const onBankChange = () => {
  if (bankForm.bankName === '其他') {
    bankForm.bankCode = ''
  } else {
    bankForm.bankCode = bankCodeMap[bankForm.bankName] || ''
  }
}

// 銀行照片上傳處理
const handleBankPhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    bankForm.bankPhoto = file
    const reader = new FileReader()
    reader.onload = (e) => {
      bankForm.bankPhotoPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 更新銀行資訊
const updateBankInfo = async () => {
  try {
    isUpdating.value = true
    const memberId = localStorage.getItem('memberId')
    
    const formData = new FormData()
    formData.append('BankName', bankForm.bankName)
    formData.append('BankCode', bankForm.bankCode)
    formData.append('AccountNumber', bankForm.accountNumber)
    formData.append('AccountName', bankForm.accountName)
    
    if (bankForm.bankPhoto) {
      formData.append('BankPhoto', bankForm.bankPhoto)
    }

    await axios.put(`/api/ApplySeller/${memberId}/bank-info`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    Swal.fire({
      icon: 'success',
      title: '更新成功',
      text: '銀行資訊已成功更新',
      confirmButtonText: '確定'
    })

    // 重新載入資訊
    await loadSellerInfo()
    editingBank.value = false

  } catch (error) {
    console.error('更新銀行資訊失敗:', error)
    Swal.fire({
      icon: 'error',
      title: '更新失敗',
      text: error.response?.data?.message || '無法更新銀行資訊',
      confirmButtonText: '確定'
    })
  } finally {
    isUpdating.value = false
  }
}

// 開始編輯地址
const startEditAddress = () => {
  addressForm.contactName = sellerInfo.value.contactName
  addressForm.contactPhone = sellerInfo.value.contactPhone
  addressForm.city = sellerInfo.value.city
  addressForm.district = sellerInfo.value.district
  addressForm.zipCode = sellerInfo.value.zipCode
  addressForm.returnAddress = sellerInfo.value.returnAddress
  editingAddress.value = true
}

// 取消編輯地址
const cancelEditAddress = () => {
  editingAddress.value = false
  Object.keys(addressForm).forEach(key => {
    addressForm[key] = ''
  })
}

// 城市變更處理
const onCityChange = () => {
  addressForm.district = ''
  addressForm.zipCode = ''
}

// 區域變更處理
const onDistrictChange = () => {
  const selectedDistrict = availableDistricts.value.find(d => d.name === addressForm.district)
  if (selectedDistrict) {
    addressForm.zipCode = selectedDistrict.zipCode
  }
}

// 更新地址資訊
const updateAddressInfo = async () => {
  try {
    isUpdating.value = true
    const memberId = localStorage.getItem('memberId')
    
    const data = {
      contactName: addressForm.contactName,
      contactPhone: addressForm.contactPhone,
      city: addressForm.city,
      district: addressForm.district,
      zipCode: addressForm.zipCode,
      returnAddress: addressForm.returnAddress
    }

    await axios.put(`/api/ApplySeller/${memberId}/address-info`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    Swal.fire({
      icon: 'success',
      title: '更新成功',
      text: '地址資訊已成功更新',
      confirmButtonText: '確定'
    })

    // 重新載入資訊
    await loadSellerInfo()
    editingAddress.value = false

  } catch (error) {
    console.error('更新地址資訊失敗:', error)
    Swal.fire({
      icon: 'error',
      title: '更新失敗',
      text: error.response?.data?.message || '無法更新地址資訊',
      confirmButtonText: '確定'
    })
  } finally {
    isUpdating.value = false
  }
}

// 工具函數
const maskIdNumber = (idNumber) => {
  if (!idNumber) return ''
  if (idNumber.length < 8) return idNumber
  return idNumber.substring(0, 3) + '****' + idNumber.substring(7)
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return '已認證'
    case 'pending':
      return '審核中'
    case 'rejected':
      return '未通過'
    default:
      return '未知狀態'
  }
}

// 組件掛載時載入資料
onMounted(() => {
  loadSellerInfo()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.seller-center {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
 background-color: #f8f9fa;
}

/* 載入遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading-spinner i {
  font-size: 2.5rem;
  color: #eb5757;
}

.loading-spinner span {
  color: #3d3b3b;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 頁面標題 */
.page-header {
   background-color: #f8f9fa;
  border-bottom: 1px solid #eef2f7;
  padding: 30px 40px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-section i {
  font-size: 2.5rem;
  color: #eb5757;
}

.title-section h1 {
  font-size: 2rem;
  color: #3d3b3b;
  font-weight: 700;
  margin: 0;
}

.title-section p {
  color: #666;
  font-size: 1rem;
  margin: 5px 0 0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge.approved {
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  color: #2e7d32;
}

.status-badge.pending {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #ef6c00;
}

.status-badge.rejected {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  color: #c62828;
}

/* 主要內容區 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

/* 側邊欄 */
.sidebar {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(235, 87, 87, 0.05);
  color: #eb5757;
}

.nav-item.active {
  background: linear-gradient(135deg, #eb5757, #e90606);
  color: white;
  box-shadow: 0 4px 15px rgba(235, 87, 87, 0.3);
}

.nav-item i {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

/* 內容區域 */
.content-area {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.tab-content {
  padding: 40px;
}

.section-header {
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 1.6rem;
  color: #3d3b3b;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h2 i {
  color: #eb5757;
}

.section-header p {
  color: #666;
  font-size: 1rem;
}

/* 資訊卡片 */
.info-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #3d3b3b;
  font-size: 1rem;
}

.info-row span {
  color: #666;
  font-size: 1rem;
}

.status-tag {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-tag.approved {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-tag.pending {
  background: #fff3e0;
  color: #ef6c00;
}

.status-tag.rejected {
  background: #ffebee;
  color: #c62828;
}

.info-note {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #e3f2fd;
  color: #1976d2;
  padding: 15px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
}

/* 銀行和地址卡片 */
.bank-card,
.address-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
}

.bank-header,
.address-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.bank-icon,
.address-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #eb5757, #e90606);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.bank-details h3,
.address-details h3 {
  font-size: 1.3rem;
  color: #3d3b3b;
  font-weight: 600;
  margin-bottom: 5px;
}

.bank-details p,
.address-details p {
  color: #666;
  font-size: 1rem;
  margin-bottom: 5px;
}

.account-name {
  font-size: 0.9rem;
  color: #999;
}

.full-address {
  color: #666;
  line-height: 1.5;
}

.zipcode {
  color: #999;
  font-size: 0.9rem;
}

.btn-edit {
  background: white;
  border: 2px solid #eb5757;
  color: #eb5757;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.btn-edit:hover {
  background: #eb5757;
  color: white;
}

.bank-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-item label {
  font-size: 0.9rem;
  color: #999;
  font-weight: 500;
}

.meta-item span {
  font-size: 1rem;
  color: #3d3b3b;
  font-weight: 600;
}

/* 表單樣式 */
.edit-form {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  height: 60px;
  background-color: #f8f9fa;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 30px 1fr;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-field:focus-within {
  border-color: #eb5757;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(235, 87, 87, 0.1);
}

.input-field i {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.1rem;
}

.input-field input,
.input-field select,
.input-field textarea {
  background: none;
  border: none;
  outline: none;
  padding: 0 15px;
  font-size: 1rem;
  color: #3d3b3b;
  font-weight: 500;
  font-family: inherit;
}

.input-field textarea {
  resize: none;
  padding: 15px;
  line-height: 1.5;
  grid-column: 1 / -1;
}

.address-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

/* 上傳區域 */
.upload-section {
  margin: 30px 0;
}

.upload-label {
  display: block;
  width: 100%;
  min-height: 150px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-label:hover {
  border-color: #eb5757;
  background: rgba(235, 87, 87, 0.05);
}

.upload-label.has-file {
  border-color: #eb5757;
  border-style: solid;
}

.upload-label input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.upload-content i {
  font-size: 2rem;
  color: #999;
  margin-bottom: 10px;
}

.upload-content span {
  font-weight: 600;
  color: #3d3b3b;
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.upload-preview {
  text-align: center;
  margin-top: 15px;
}

.upload-preview img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-name {
  font-size: 0.85rem;
  color: #666;
}

/* 按鈕樣式 */
.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.outline {
  background: white;
  color: #eb5757;
  border-color: #eb5757;
}

.btn.outline:hover:not(:disabled) {
  background: #eb5757;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(235, 87, 87, 0.3);
}

.btn.solid {
  background: linear-gradient(135deg, #eb5757, #e90606);
  color: white;
  border-color: transparent;
}

.btn.solid:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(235, 87, 87, 0.4);
}

.btn.danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn.danger:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.form-actions.center {
  justify-content: center;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px 20px;
  }
  
  .sidebar {
    order: 2;
  }
  
  .content-area {
    order: 1;
  }
  
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    gap: 10px;
  }
  
  .nav-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .title-section i {
    font-size: 2rem;
  }
  
  .title-section h1 {
    font-size: 1.5rem;
  }
  
  .tab-content {
    padding: 30px 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .address-row {
    grid-template-columns: 1fr;
  }
  
  .bank-meta {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .bank-header,
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .btn-edit {
    margin-left: 0;
    align-self: flex-start;
  }
}
</style>