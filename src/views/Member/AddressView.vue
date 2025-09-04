<template>
  <main>
    <div class="container container-fluid">
      <div class="address-container">
        <div class="header-section">
          <h2><i class="fas fa-map-marker-alt"></i> 我的地址</h2>
          <button @click="showAddForm = true" class="add-address-button">
            <i class="fas fa-plus"></i>
            新增地址
          </button>
        </div>

        <!-- 地址列表 -->
        <div class="address-list" v-if="addresses.length > 0">
          <div 
            v-for="address in addresses" 
            :key="address.id"
            class="address-card"
            :class="{ 'default-address': address.isDefault }"
          >
            <div class="address-content">
              <div class="address-header">
                <div class="recipient-info">
                  <span class="recipient-name">{{ address.recipientName }}</span>
                  <span class="phone-number">{{ address.phoneNumber }}</span>
                </div>
                <div class="address-actions">
                  <button @click="editAddress(address)" class="edit-btn">
                    <i class="fas fa-edit"></i> 編輯
                  </button>
                  <button 
                    @click="deleteAddress(address.id)" 
                    class="delete-btn"
                    :disabled="address.isDefault"
                  >
                    <i class="fas fa-trash"></i> 刪除
                  </button>
                </div>
              </div>
              <div class="address-detail">
                <span class="address-text">
                  {{ address.zipCode }} {{ address.city }}{{ address.district }}{{ address.streetAddress }}
                </span>
                <div class="address-tags">
                  <span v-if="address.isDefault" class="default-tag">預設地址</span>
                  <button 
                    v-else 
                    @click="setDefaultAddress(address.id)"
                    class="set-default-btn"
                  >
                    設為預設
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-else class="empty-state">
          <i class="fas fa-map-marker-alt empty-icon"></i>
          <p>您還沒有新增任何地址</p>
          <button @click="showAddForm = true" class="add-first-address-btn">
            立即新增地址
          </button>
        </div>

        <!-- 新增/編輯地址表單 -->
        <div v-if="showAddForm || editingAddress" class="form-overlay">
          <div class="address-form">
            <div class="form-header">
              <h3>{{ editingAddress ? '編輯地址' : '新增地址' }}</h3>
              <button @click="cancelForm" class="close-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="form-content">
              <div class="form-field">
                <label>收件人姓名 <span class="required">*</span></label>
                <input 
                  v-model="formData.recipientName" 
                  type="text" 
                  placeholder="請輸入收件人姓名"
                  :class="{ 'error': errors.recipientName }"
                />
                <span v-if="errors.recipientName" class="error-message">{{ errors.recipientName }}</span>
              </div>

              <div class="form-field">
                <label>手機號碼 <span class="required">*</span></label>
                <input 
                  v-model="formData.phoneNumber" 
                  type="tel" 
                  placeholder="請輸入手機號碼"
                  :class="{ 'error': errors.phoneNumber }"
                />
                <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>縣市 <span class="required">*</span></label>
                  <select 
                    v-model="formData.city" 
                    @change="onCityChange"
                    :class="{ 'error': errors.city }"
                  >
                    <option value="">請選擇縣市</option>
                    <option v-for="city in cities" :key="city.name" :value="city.name">
                      {{ city.name }}
                    </option>
                  </select>
                  <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
                </div>

                <div class="form-field">
                  <label>區域 <span class="required">*</span></label>
                  <select 
                    v-model="formData.district" 
                    @change="onDistrictChange"
                    :disabled="!formData.city"
                    :class="{ 'error': errors.district }"
                  >
                    <option value="">請選擇區域</option>
                    <option v-for="district in availableDistricts" :key="district.name" :value="district.name">
                      {{ district.name }}
                    </option>
                  </select>
                  <span v-if="errors.district" class="error-message">{{ errors.district }}</span>
                </div>

                <div class="form-field">
                  <label>郵遞區號</label>
                  <input 
                    v-model="formData.zipCode" 
                    type="text" 
                    placeholder="自動帶入"
                    readonly
                  />
                </div>
              </div>

              <div class="form-field">
                <label>詳細地址 <span class="required">*</span></label>
                <input 
                  v-model="formData.streetAddress" 
                  type="text" 
                  placeholder="請輸入詳細地址"
                  :class="{ 'error': errors.streetAddress }"
                />
                <span v-if="errors.streetAddress" class="error-message">{{ errors.streetAddress }}</span>
              </div>

              <div class="form-field checkbox-field">
                <label class="checkbox-label">
                  <input 
                    v-model="formData.isDefault" 
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  設為預設地址
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button @click="cancelForm" class="cancel-button">
                取消
              </button>
              <button @click="saveAddress" class="save-button" :disabled="isSaving">
                {{ isSaving ? '儲存中...' : '完成' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="showSuccessMessage" class="success-overlay" @click="showSuccessMessage = false">
          <div class="success-modal">
            <i class="fas fa-check-circle success-icon"></i>
            <p>{{ successMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
export default {
  data() {
    return {
      addresses: [],
      showAddForm: false,
      editingAddress: null,
      formData: {
        recipientName: '',
        phoneNumber: '',
        city: '',
        district: '',
        zipCode: '',
        streetAddress: '',
        isDefault: false,
          memberId: null,
      },
      errors: {},
      isSaving: false,
      showSuccessMessage: false,
      successMessage: '',
        cities : [
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
      // 小琉球屬於琉球鄉
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
      { name: '綠島鄉', zipCode: '951' }, // 綠島
      { name: '蘭嶼鄉', zipCode: '972' }  // 蘭嶼
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
],
      API_BASE: process.env.VUE_APP_API_BASE_URL || 'https://jadeapi-production.up.railway.app', // 換成你的 API URL
      memberId: '', // 改成空字串，動態帶入
    };
  },
  computed: {
    availableDistricts() {
      const selectedCity = this.cities.find(city => city.name === this.formData.city);
      return selectedCity ? selectedCity.districts : [];
    }
  },
mounted() {
  const memberId = localStorage.getItem('memberId');
  if (memberId) {
    this.memberId = memberId;
    this.fetchAddresses();
  } else {
    Swal.fire('找不到登入會員資料，請先登入');
    // 如果你想跳轉去登入頁，可以加這行
    // this.$router.push('/login');
  }
},
  methods: {
    async fetchAddresses() {
      if (!this.memberId) {
        console.warn('無會員ID，無法取得地址');
        return;
      }
      try {
        const res = await axios.get(`${this.API_BASE}/api/members/${this.memberId}/addresses`);
        this.addresses = res.data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.addresses = [];
        } else {
          console.error('取得地址失敗', error);
        }
      }
    },
    onCityChange() {
      this.formData.district = '';
      this.formData.zipCode = '';
    },
    onDistrictChange() {
      const selectedDistrict = this.availableDistricts.find(d => d.name === this.formData.district);
      if (selectedDistrict) {
        this.formData.zipCode = selectedDistrict.zipCode;
      }
    },
    editAddress(address) {
      this.editingAddress = address;
      this.formData = { ...address };
      this.showAddForm = true;
    },
    cancelForm() {
      this.showAddForm = false;
      this.editingAddress = null;
      this.formData = {
        recipientName: '',
        phoneNumber: '',
        city: '',
        district: '',
        zipCode: '',
        streetAddress: '',
        isDefault: false
      };
      this.errors = {};
    },
    validateForm() {
      this.errors = {};
      if (!this.formData.recipientName.trim()) this.errors.recipientName = '請輸入收件人姓名';
      if (!this.formData.phoneNumber.trim()) this.errors.phoneNumber = '請輸入手機號碼';
      else if (!/^09\d{8}$/.test(this.formData.phoneNumber)) this.errors.phoneNumber = '請輸入正確的手機號碼格式';
      if (!this.formData.city) this.errors.city = '請選擇縣市';
      if (!this.formData.district) this.errors.district = '請選擇區域';
      if (!this.formData.streetAddress.trim()) this.errors.streetAddress = '請輸入詳細地址';
      return Object.keys(this.errors).length === 0;
    },
    async saveAddress() {
      if (!this.validateForm()) return;

      if (!this.memberId) {
        Swal.fire('會員未登入，無法儲存地址');
        return;
      }

      this.isSaving = true;
      try {
        let res;
        if (this.editingAddress) {
          res = await axios.put(`${this.API_BASE}/api/members/${this.memberId}/addresses/${this.editingAddress.id}`, this.formData);
        } else {
          res = await axios.post(`${this.API_BASE}/api/members/${this.memberId}/addresses`, this.formData);
        }

        const updatedAddress = res.data;

        if (this.editingAddress) {
          const index = this.addresses.findIndex(a => a.id === this.editingAddress.id);
          if (index !== -1) this.addresses[index] = updatedAddress;
          this.successMessage = '地址修改成功！';
        } else {
          if (updatedAddress.isDefault) this.addresses.forEach(a => a.isDefault = false);
          this.addresses.push(updatedAddress);
          this.successMessage = '地址新增成功！';
        }

        this.cancelForm();
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
      } catch (error) {
        console.error('儲存地址失敗', error);
        Swal.fire('儲存地址失敗，請稍後再試');
      } finally {
        this.isSaving = false;
      }
    },
    async setDefaultAddress(addressId) {
      try {
        await axios.patch(`${this.API_BASE}/api/members/${this.memberId}/addresses/set-default`, { addressId });

        this.addresses.forEach(a => a.isDefault = a.id === addressId);
        this.successMessage = '預設地址設定成功！';
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
      } catch (error) {
        console.error('設定預設地址失敗', error);
      }
    },
    async deleteAddress(addressId) {
      if (!confirm('確定要刪除這個地址嗎？')) return;

      try {
        await axios.delete(`${this.API_BASE}/api/members/${this.memberId}/addresses/${addressId}`);

        this.addresses = this.addresses.filter(a => a.id !== addressId);
        this.successMessage = '地址刪除成功！';
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
      } catch (error) {
        console.error('刪除地址失敗', error);
        Swal.fire(error.response?.data || '刪除地址失敗');
      }
    }
  }
};
</script>



<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;
}

.address-container {
  background-color: #fff9ed;
  border-radius: 12px;
  padding: 40px 50px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 6px 12px rgba(105, 134, 94, 0.5);
}

/* 頁面標題區域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.header-section h2 {
  color: #2e4e34;
  font-size: 2rem;
  margin: 0;
}

.header-section h2 i {
  margin-right: 10px;
}

.add-address-button {
  background-color: #333;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s;
}

.add-address-button:hover {
  background-color: #555;
}

.add-address-button i {
  margin-right: 8px;
}

/* 地址卡片樣式 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.address-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.address-card.default-address {
  border-color: #4CAF50;
  border-width: 2px;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipient-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.recipient-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.phone-number {
  color: #666;
  font-size: 1rem;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.address-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-text {
  color: #555;
  font-size: 1rem;
}

.address-tags {
  display: flex;
  align-items: center;
}

.default-tag {
  background-color: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.set-default-btn {
  background-color: transparent;
  color: #2196F3;
  border: 1px solid #2196F3;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.set-default-btn:hover {
  background-color: #2196F3;
  color: white;
}

/* 空狀態樣式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.add-first-address-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-first-address-btn:hover {
  background-color: #45a049;
}

/* 表單覆蓋層 */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.address-form {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.form-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.form-content {
  padding: 24px;
}

.form-field {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  gap: 15px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.required {
  color: #f44336;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #2196F3;
}

.form-field input.error,
.form-field select.error {
  border-color: #f44336;
}

.form-field input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}

/* 複選框樣式 */
.checkbox-field {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0;
}

.checkbox-input {
  display: none;
}
.checkbox-custom {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 3px;
  margin-right: 10px;
  position: relative;
  transition: all 0.3s;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 表單按鈕 */
.form-actions {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.cancel-button,
.save-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.save-button {
  background-color: #4CAF50;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #45a049;
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 成功提示 */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  cursor: pointer;
}

.success-modal {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: successPop 0.5s ease-out;
}

.success-icon {
  font-size: 3rem;
  color: #4CAF50;
  margin-bottom: 15px;
}

.success-modal p {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

@keyframes successPop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .address-container {
    padding: 20px;
    margin: 10px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-section h2 {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .address-actions {
    align-self: flex-end;
  }
  
  .address-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .save-button {
    width: 100%;
  }
}
</style>