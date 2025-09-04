<template>
  <div class="shipping-page">
    <div class="container py-5">
      <!-- Header Section -->
      <div class="page-header text-center mb-5">
        <h1 class="page-title">物流配送說明</h1>
        <p class="page-subtitle">多元配送方式，讓您購物更便利</p>
      </div>

      <!-- Shipping Options Overview -->
      <div class="shipping-overview mb-5">
        <div class="row">
          <div class="col-md-4 mb-4" v-for="(option, index) in shippingOptions" :key="index">
            <div class="shipping-card" @click="selectShipping(index)">
              <h4>{{ option.name }}</h4>
              <div class="shipping-fee">運費 ${{ option.fee }}</div>
              <div class="shipping-time">{{ option.deliveryTime }}</div>
              <ul class="shipping-features">
                <li v-for="feature in option.features" :key="feature">
                  <i class="fas fa-check text-success me-2"></i>{{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Information -->
      <div class="shipping-details">
        <div class="row">
          <!-- Left sidebar - shipping method tabs -->
          <div class="col-lg-3 mb-4">
            <div class="shipping-tabs">
              <div class="tab-header">
                <h5>配送方式</h5>
              </div>
              <div class="nav nav-pills flex-column">
                <button 
                  v-for="(option, index) in shippingOptions" 
                  :key="index"
                  class="nav-link"
                  :class="{ active: selectedShipping === index }"
                  @click="selectShipping(index)"
                >
                  {{ option.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right content - detailed info -->
          <div class="col-lg-9">
            <div class="shipping-content">
              <div v-if="selectedShipping !== null" class="shipping-detail">
                <!-- Current selected shipping method -->
                <div class="detail-header">
                  <div class="d-flex align-items-center mb-3">
                    <div>
                      <h3>{{ currentShipping.name }}</h3>
                      <p class="text-muted mb-0">{{ currentShipping.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Shipping Information -->
                <div class="info-section mb-4">
                  <h5 class="section-title">配送資訊</h5>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <div class="info-item">
                        <i class="fas fa-shipping-fast info-icon"></i>
                        <div>
                          <strong>配送時間</strong>
                          <p>{{ currentShipping.deliveryTime }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="info-item">
                        <i class="fas fa-dollar-sign info-icon"></i>
                        <div>
                          <strong>運費</strong>
                          <p>${{ currentShipping.fee }} {{ currentShipping.freeShippingNote }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="info-item">
                        <i class="fas fa-box info-icon"></i>
                        <div>
                          <strong>尺寸限制</strong>
                          <p>{{ currentShipping.sizeLimit }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="info-item">
                        <i class="fas fa-weight-hanging info-icon"></i>
                        <div>
                          <strong>重量限制</strong>
                          <p>{{ currentShipping.weightLimit }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Process Steps -->
                <div class="process-section mb-4">
                  <h5 class="section-title">配送流程</h5>
                  <div class="process-timeline">
                    <div v-for="(step, index) in currentShipping.process" :key="index" class="process-step">
                      <div class="step-number">{{ index + 1 }}</div>
                      <div class="step-content">
                        <h6>{{ step.title }}</h6>
                        <p>{{ step.description }}</p>
                        <div v-if="step.note" class="step-note">
                          <i class="fas fa-info-circle"></i>
                          {{ step.note }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Special Notes -->
                <div v-if="currentShipping.specialNotes" class="notes-section">
                  <h5 class="section-title">特別注意事項</h5>
                  <div class="alert alert-info">
                    <ul class="mb-0">
                      <li v-for="note in currentShipping.specialNotes" :key="note">{{ note }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section mt-5">
        <h2 class="section-title text-center mb-4">物流常見問題</h2>
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="accordion" id="shippingFAQ">
              <div v-for="(faq, index) in faqs" :key="index" class="accordion-item">
                <h3 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    type="button"
                    @click="toggleFaq(index)"
                    :class="{ collapsed: !faq.isOpen }"
                  >
                    {{ faq.question }}
                  </button>
                </h3>
                <div
                  class="accordion-collapse collapse"
                  :class="{ show: faq.isOpen }"
                >
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tracking Section -->
      <div class="tracking-section mt-5">
        <div class="tracking-card">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h3 class="mb-3">
                <i class="fas fa-search me-2"></i>
                追蹤您的包裹
              </h3>
              <p class="mb-4">輸入訂單編號或物流單號，隨時掌握包裹配送狀態</p>
            </div>
            <div class="col-lg-6">
              <div class="tracking-form">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="請輸入訂單編號或物流單號"
                    v-model="trackingNumber"
                  >
                  <button class="btn btn-primary" @click="trackPackage">
                    <i class="fas fa-search me-2"></i>追蹤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShippingInfoView',
  data() {
    return {
      selectedShipping: 0,
      trackingNumber: '',
      shippingOptions: [
        {
          name: '黑貓宅急便',
          fee: 80,
          freeShippingNote: '(滿千免運)',
          deliveryTime: '1-2個工作天',
          description: '專業宅配服務，直送府上最便利',
          sizeLimit: '長寬高總和不超過150cm',
          weightLimit: '20公斤以內',
          features: ['指定時段配送', '貨到付款服務', '簡訊通知'],
          process: [
            {
              title: '商品出貨',
              description: '賣家出貨後，系統會發送出貨通知郵件給您'
            },
            {
              title: '物流取件',
              description: '黑貓宅急便司機到賣家處取件，開始配送流程'
            },
            {
              title: '配送中',
              description: '包裹已在配送路線上，可透過物流單號追蹤進度',
              note: '配送前會有簡訊通知，可指定收件時段'
            },
            {
              title: '送達簽收',
              description: '司機送達指定地址，收件人簽收完成配送'
            }
          ],
          specialNotes: [
            '配送時間：週一至週六 8:00-20:00',
            '可指定配送時段：上午(8-12點)、下午(13-17點)、晚上(18-20點)',
            '如收件人不在，會留置配送通知單',
            '偏遠地區可能需要額外1-2天配送時間'
          ]
        },
        {
          name: '7-ELEVEN超商取貨',
          fee: 60,
          freeShippingNote: '(滿600免運)',
          deliveryTime: '2-3個工作天',
          description: '全台7-ELEVEN門市皆可取貨，24小時營業超方便',
          sizeLimit: '45x30x30cm以內',
          weightLimit: '5公斤以內',
          features: ['24小時取貨', '全台據點最多', '取貨付款'],
          process: [
            {
              title: '選擇取貨門市',
              description: '結帳時選擇方便的7-ELEVEN門市作為取貨地點'
            },
            {
              title: '商品寄送',
              description: '賣家將商品寄送至您指定的7-ELEVEN門市'
            },
            {
              title: '到貨通知',
              description: '商品到達門市後，會發送簡訊通知您前往取貨',
              note: '請於7天內前往取貨，逾期將退回寄件人'
            },
            {
              title: '門市取貨',
              description: '攜帶身分證件至門市，向店員報取貨碼即可取貨'
            }
          ],
          specialNotes: [
            '取貨期限：到貨後7天內取貨',
            '需攜帶身分證件或駕照等有照片證件',
            '部分大型商品不適用超商取貨',
            '取貨時請檢查商品是否完整'
          ]
        },
        {
          name: '全家便利商店',
          fee: 60,
          freeShippingNote: '(滿600免運)',
          deliveryTime: '2-3個工作天',
          description: '全家便利商店取貨服務，就在您的生活圈',
          sizeLimit: '45x30x30cm以內',
          weightLimit: '5公斤以內',
          features: ['據點遍布全台', '營業時間長', '取貨付款'],
          process: [
            {
              title: '選擇取貨門市',
              description: '結帳時選擇方便的全家便利商店作為取貨地點'
            },
            {
              title: '商品寄送',
              description: '賣家將商品寄送至您指定的全家便利商店'
            },
            {
              title: '到貨通知',
              description: '商品到達門市後，會發送簡訊及Email通知您',
              note: '請於7天內前往取貨，逾期將退回寄件人'
            },
            {
              title: '門市取貨',
              description: '攜帶身分證件至門市，提供取貨碼即可完成取貨'
            }
          ],
          specialNotes: [
            '取貨期限：到貨後7天內取貨',
            '需攜帶身分證明文件',
            '支援取貨付款服務',
            '如有問題可洽詢門市店員'
          ]
        }
      ],
      faqs: [
        {
          question: '如何選擇最適合的配送方式？',
          answer: '如果您希望快速收到商品且在家方便收件，建議選擇黑貓宅急便。如果您上班時間較忙碌，建議選擇超商取貨，可以在方便的時間前往取貨。',
          isOpen: false
        },
        {
          question: '什麼情況下可以享有免運費？',
          answer: '黑貓宅急便滿$1000免運，7-ELEVEN和全家便利商店滿$600免運。部分活動期間可能有不同的免運門檻，請留意促銷資訊。',
          isOpen: false
        },
        {
          question: '可以修改配送地址嗎？',
          answer: '訂單成立後，如商品尚未出貨，可聯絡客服協助修改配送地址。如已出貨，則無法修改，建議聯絡物流業者協調配送事宜。',
          isOpen: false
        },
        {
          question: '超商取貨逾期未取怎麼辦？',
          answer: '超商取貨期限為7天，逾期商品會退回給賣家。如有特殊情況無法及時取貨，請提前聯絡客服協助處理。',
          isOpen: false
        },
        {
          question: '配送過程中商品損壞怎麼辦？',
          answer: '如收到商品時發現包裝破損或商品損壞，請立即拍照記錄並聯絡客服，我們會協助您處理後續退換貨事宜。',
          isOpen: false
        }
      ]
    }
  },
  computed: {
    currentShipping() {
      return this.shippingOptions[this.selectedShipping]
    }
  },
  methods: {
    selectShipping(index) {
      this.selectedShipping = index
    },
    toggleFaq(index) {
      this.faqs[index].isOpen = !this.faqs[index].isOpen
    },
    trackPackage() {
      if (!this.trackingNumber.trim()) {
        alert('請輸入訂單編號或物流單號')
        return
      }
      // 實際應用中會連接到物流追蹤系統
      alert(`正在查詢包裹狀態：${this.trackingNumber}`)
    }
  }
}
</script>

<style scoped>
.shipping-page {
  padding-top: 50px;
  min-height: calc(100vh - 90px);
  background-color: #f8f9fa;
}

.page-header {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.shipping-overview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.shipping-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.shipping-card:hover {
  background: white;
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  border-color: #e4dcd1;
}

.shipping-icon {
  margin-bottom: 1.5rem;
}

.shipping-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.shipping-fee {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e3a4a4;
  margin-bottom: 0.5rem;
}

.shipping-time {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.shipping-features {
  list-style: none;
  padding: 0;
  text-align: left;
}

.shipping-features li {
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: #555;
}

.shipping-details {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.shipping-tabs {
  background: #f8f9fa;
  height: 100%;
}

.tab-header {
  background: #e4dcd1;
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.tab-header h5 {
  margin: 0;
  font-weight: 600;
}

.shipping-tabs .nav-link {
  background: transparent;
  color: #666;
  border: none;
  border-radius: 0;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.shipping-tabs .nav-link:hover {
  background: white;
  color: #333;
}

.shipping-tabs .nav-link.active {
  background: white;
  color: #eb5757;
  font-weight: 600;
  border-left: 4px solid #E5D2D2;
}

.shipping-content {
  padding: 2rem;
}

.detail-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.detail-header h3 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #df9dac;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.alert {
  background-color: #faf6eb;
  border-color: #faf6eb;
  color: #022c5c;
}


.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-item strong {
  color: #333;
  font-size: 0.95rem;
}

.info-item p {
  color: #666;
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

.process-timeline {
  position: relative;
}

.process-step {
  display: flex;
  margin-bottom: 2rem;
  position: relative;
}

.process-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 25px;
  top: 50px;
  width: 2px;
  height: calc(100% - 20px);
  background: linear-gradient(to bottom, #ea66b3, #e9ecef);
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #df9dac 10%, #faf6eb 90%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.step-content h6 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.step-note {
  background: #fff3cd;
  color: #856404;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.faq-section {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.accordion-button {
  font-weight: 600;
  color: #333;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  color: #df9dac;
}

.tracking-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tracking-card {
  background: linear-gradient(135deg, #df9dac 10%, #faf6eb 90%);
  color: white;
  padding: 3rem;
  border-radius: 12px;
}

.tracking-card h3 {
  color: white;
  font-weight: 600;
}

.tracking-form .form-control {
  border-radius: 25px 0 0 25px;
  padding: 0.75rem 1.25rem;
  border: none;
}

.tracking-form .btn {
  border-radius: 0 25px 25px 0;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  background-color: #ee3c66;
}

@media (max-width: 991.98px) {
  .shipping-tabs {
    margin-bottom: 2rem;
  }
  
  .tab-header {
    border-radius: 12px 12px 0 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .shipping-card {
    margin-bottom: 1rem;
  }
  
  .shipping-content {
    padding: 1rem;
  }
  
  .detail-header .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .process-step {
    margin-bottom: 1.5rem;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    margin-right: 1rem;
  }
  
  .process-step:not(:last-child)::after {
    left: 20px;
    top: 40px;
  }
  
  .tracking-card {
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .tracking-form {
    margin-top: 1rem;
  }
}
</style>